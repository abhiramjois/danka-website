// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/**
	 * Provided by the Workers runtime, not by TypeScript. Declared here rather
	 * than pulling in @cloudflare/workers-types, which would shadow the DOM
	 * Request/Response types used everywhere else in the project.
	 */
	class EmailMessage {
		constructor(from: string, to: string, raw: string);
	}

	namespace App {
		interface EmailSender {
			send(message: EmailMessage): Promise<void>;
		}

		interface Platform {
			env: {
				EMAIL: EmailSender;
			};
		}
	}
}

export {};