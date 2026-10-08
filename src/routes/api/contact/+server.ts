import { CONTACT_EMAIL } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const FROM = { name: 'Danka Studios', email: 'website@dankastudios.com' };

/**
 * Normalises the configured recipient.
 *
 * The recipient comes from CONTACT_EMAIL, supplied as an environment variable
 * at build time (a Cloudflare build variable in production, or .env locally)
 * and inlined into the server bundle by $env/static/private. Nothing about the
 * destination is hardcoded, so testing against another inbox needs no code
 * change — but Cloudflare only permits sends to addresses confirmed in Email
 * Routing, which is what stops this endpoint mailing arbitrary strangers.
 *
 * Cloudflare's dashboard keeps a value pasted from a shell export verbatim, so
 * `CONTACT_EMAIL="a@b.com"` arrives with the quotes still attached and the
 * runtime rejects it as an invalid address. Strip them rather than failing at
 * send time with an opaque error.
 */
function configuredRecipient(value: string | undefined): string | undefined {
	const trimmed = value?.trim().replace(/^["']|["']$/g, '').trim();
	return trimmed ? trimmed : undefined;
}

const TO = configuredRecipient(CONTACT_EMAIL);

const LIMITS = {
	name: 100,
	email: 254,
	projectType: 100,
	message: 5000,
	body: 20000
};

const EMAIL_RE = /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\".]+(\.[^\s@,;:<>()[\]\\".]+)+$/;

const CROSS_ORIGIN = 'Cross-origin submissions are not accepted.';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * Best-effort per-isolate throttle. Isolates are distributed and short-lived,
 * so this blunts casual form spam rather than eliminating it. A hard limit
 * belongs in a WAF rule.
 */
const hits = new Map<string, number[]>();

function throttled(ip: string) {
	const now = Date.now();

	if (hits.size > 5000) {
		for (const [key, times] of hits) {
			const live = times.filter((t) => now - t < WINDOW_MS);
			if (live.length) hits.set(key, live);
			else hits.delete(key);
		}
	}

	const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) return true;

	recent.push(now);
	hits.set(ip, recent);
	return false;
}

/** Strip anything that could break out of a header, then cap the length. */
function scalar(value: unknown, max: number): string {
	if (typeof value !== 'string') return '';
	return value.replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function buildBody(fields: {
	name: string;
	email: string;
	projectType: string;
	message: string;
}) {
	return [
		`Name: ${fields.name}`,
		`Email: ${fields.email}`,
		`Project type: ${fields.projectType}`,
		'',
		'Message:',
		fields.message,
		'',
		'Sent from the collaborate form on dankastudios.com'
	].join('\n');
}

/**
 * The one endpoint on this site that cannot be prerendered: it has to run at
 * request time to hand the enquiry to Cloudflare's email service.
 */
export const prerender = false;

export const POST: RequestHandler = async ({ request, getClientAddress, platform }) => {
	const sender = platform?.env?.EMAIL;
	if (!sender) {
		console.error('EMAIL binding is missing from the worker environment');
		return json({ ok: false, error: 'Email delivery is not configured.' }, { status: 500 });
	}

	const to = TO;
	if (!to) {
		console.error('CONTACT_EMAIL was not set when this Worker was built');
		return json({ ok: false, error: 'Email delivery is not configured.' }, { status: 500 });
	}

	const url = new URL(request.url);

	const origin = request.headers.get('Origin');
	if (origin) {
		let sameHost = false;
		try {
			sameHost = new URL(origin).host === url.host;
		} catch {
			sameHost = false;
		}
		if (!sameHost) {
			return json({ ok: false, error: CROSS_ORIGIN }, { status: 403 });
		}
	}

	const declared = Number(request.headers.get('content-length') || 0);
	if (declared > LIMITS.body) {
		return json({ ok: false, error: 'That message is too long to send.' }, { status: 413 });
	}

	let ip = 'unknown';
	try {
		ip = getClientAddress();
	} catch {
		// No request.cf in local dev; the throttle just keys on "unknown".
	}

	if (throttled(ip)) {
		return json(
			{ ok: false, error: 'Too many submissions from your connection. Try again shortly.' },
			{ status: 429 }
		);
	}

	let payload: Record<string, unknown>;
	try {
		payload = await request.json();
	} catch {
		return json({ ok: false, error: 'Could not read that submission.' }, { status: 400 });
	}

	// Honeypot. Real visitors never see this field, so a filled one means a bot.
	// Answer as though it worked so the bot does not learn to adapt.
	if (typeof payload.company === 'string' && payload.company.trim() !== '') {
		return json({ ok: true });
	}

	const name = scalar(payload.name, LIMITS.name);
	const email = scalar(payload.email, LIMITS.email);
	const projectType = scalar(payload.projectType, LIMITS.projectType);
	const message =
		typeof payload.message === 'string'
			? payload.message.replace(/\r\n/g, '\n').trim().slice(0, LIMITS.message)
			: '';

	if (!name || !message) {
		return json({ ok: false, error: 'Please add your name and a short message.' }, { status: 400 });
	}

	if (!EMAIL_RE.test(email)) {
		return json({ ok: false, error: 'That email address does not look right.' }, { status: 400 });
	}

	try {
		await sender.send({
			to,
			from: FROM,
			subject: `Collaboration enquiry — ${name}`,
			text: buildBody({ name, email, projectType, message }),
			replyTo: email
		});
	} catch (error) {
		// Cloudflare's send errors carry a `code` (E_RECIPIENT_NOT_ALLOWED,
		// E_SENDER_NOT_VERIFIED, …) that the dashboard logs will show.
		console.error('contact form send failed', (error as { code?: string })?.code, error);
		return json(
			{ ok: false, error: 'Something went wrong sending that. Please try again.' },
			{ status: 502 }
		);
	}

	return json({ ok: true });
};