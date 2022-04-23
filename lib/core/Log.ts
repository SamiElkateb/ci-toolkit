class Log {
	private red: string;
	constructor() {
		this.red = '\x1b[31m%s\x1b[0m';
	}
	error(text: string) {
		console.error(this.red, text);
	}
	info(text: string) {
		console.error(text);
	}
}
export default new Log();
