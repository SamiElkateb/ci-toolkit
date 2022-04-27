import Log from '../Log';
import GitlabApiError from './GitlabApiError';
const logger = new Log();
class ErrorHandler {
	constructor() {}
	static try = async (callback: Function) => {
		try {
			await callback();
		} catch (error: unknown) {
			if (typeof error === 'string') logger.error(error);
			if (error instanceof TypeError)
				logger.error(error.message, 'Type Error');
			if (error instanceof GitlabApiError)
				logger.error(error.message, 'Gitlab Api Error');
		}
	};
}
export default ErrorHandler;
