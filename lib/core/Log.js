class Log {
	constructor() {
		this.red = '\x1b[31m%s\x1b[0m';
	}
	error(text) {
		console.error(this.red, text);
	}
	info(text) {
		console.error(text);
	}
}
module.exports = new Log();
