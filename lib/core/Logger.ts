import { assertContinue } from '../utils/assertions/assertContinue';
import { standby } from '../utils/standby';
import Lang from './lang/Lang';

class Logger {
	private red: string;
	private yellow: string;
	private logLevel: logLevel;
	private warningAction: warningAction;
	public text: Lang['language'];
	constructor(logLevel?: string, warningAction?: string) {
		const lang = new Lang();
		this.red = '\x1b[31m%s\x1b[0m';
		this.yellow = '\x1b[33m%s\x1b[0m';
		this.logLevel = 'info';
		this.warningAction = 'prompt';
		this.setLogLevel(logLevel);
		this.setWarningAction(warningAction);
		this.text = lang.language;
	}
	setLogLevel = (logLevel?: string) => {
		if (logLevel === 'debug') {
			this.logLevel = 'debug';
			return;
		}
		if (logLevel === 'warn') {
			this.logLevel = 'warn';
			return;
		}
		if (logLevel === 'error') {
			this.logLevel = 'error';
			return;
		}
		this.logLevel = 'info';
	};
	setWarningAction = (warningAction?: string) => {
		if (warningAction === 'skip') {
			this.warningAction = 'skip';
			return;
		}
		if (warningAction === 'standby') {
			this.warningAction = 'standby';
			return;
		}
		this.warningAction = 'prompt';
	};
	setLang = (language?: string) => {
		const lang = new Lang(language);
		this.text = lang.language;
	};
	error(text: string, errorType?: string) {
		if (typeof errorType !== 'undefined') {
			console.error(this.red, `${errorType}: ${text}`);
		} else {
			console.error(this.red, `error: ${text}`);
		}
	}
	async warn(text: string, continuePrompt: string) {
		if (
			this.logLevel !== 'info' &&
			this.logLevel !== 'debug' &&
			this.logLevel !== 'warn'
		) {
			return;
		}
		console.warn(this.yellow, `warn: ${text}`);
		if (this.warningAction === 'skip') return;
		if (this.warningAction === 'standby') {
			console.info(`info: Standing by for 1 minute`);
			await standby(60000);
			return;
		}
		await assertContinue(continuePrompt);
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
export default Logger;
