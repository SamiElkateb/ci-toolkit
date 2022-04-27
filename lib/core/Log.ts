type logLevel = 'error' | 'warn' | 'info' | 'debug';
class Log {
	private red: string;
	private logLevel: logLevel;
	constructor(logLevel?: string) {
		this.red = '\x1b[31m%s\x1b[0m';
		this.logLevel = 'info';
		this.setLogLevel(logLevel);
	}
	setLogLevel = (logLevel?: string) => {
		if (
			logLevel !== 'info' &&
			logLevel !== 'debug' &&
			logLevel !== 'warn'
		) {
			this.logLevel = 'info';
			return;
		}
		this.logLevel = logLevel;
	};
	error(text: string, errorType?: string) {
		if (typeof errorType !== 'undefined') {
			console.error(this.red, `${errorType}: ${text}`);
		} else {
			console.error(this.red, `error: ${text}`);
		}
	}
	warn(text: string) {
		if (
			this.logLevel !== 'info' &&
			this.logLevel !== 'debug' &&
			this.logLevel !== 'warn'
		)
			return;
		console.warn(this.red, `warn: ${text}`);
	}
	info(text: string) {
		if (this.logLevel !== 'info' && this.logLevel !== 'debug') return;
		console.info(`info: ${text}`);
	}
	debug(text: string) {
		if (this.logLevel !== 'debug') return;
		console.debug(`debug: ${text}`);
	}

	request(url: string, type?: string) {
		if (this.logLevel !== 'debug') return;
		const obfuscatedTokenUrl = url.replace(
			/access_token=.*/,
			'access_token=*****-********************'
		);
		if (typeof type !== 'undefined') {
			console.debug(
				`debug: sending ${type} request to ${obfuscatedTokenUrl}`
			);
		} else {
			console.debug(`debug: sending request to ${obfuscatedTokenUrl}`);
		}
	}
}
export default Log;
