import Log from '../Log';
const logger = new Log();
class ErrorHandler {
	constructor() {}
	static try = async (callback: Function) => {
		try {
			await callback();
		} catch (error: unknown) {
			if (typeof error === 'string') logger.error(error);
			if (error instanceof TypeError) logger.error(error.message);
		}
	};
}
export default ErrorHandler;
