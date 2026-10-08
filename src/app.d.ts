// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		/** The structured message form of the Workers `send_email` binding. */
		interface EmailMessageBuilder {
			to: string;
			from: string | { email: string; name?: string };
			subject: string;
			text?: string;
			html?: string;
			replyTo?: string;
		}

		interface EmailSender {
			send(message: EmailMessageBuilder): Promise<unknown>;
		}

		interface Platform {
			env: {
				EMAIL: EmailSender;
			};
		}
	}
}

export {};