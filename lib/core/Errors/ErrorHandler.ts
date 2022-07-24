import { ZodError } from 'zod';
import { checkIsObject, checkIsString, hasOwnProperty } from '../../utils/validations/basicTypeValidations';
import Log from '../Logger';
import GitlabApiError from './GitlabApiError';
const logger = new Log();
class ErrorHandler {
	constructor() {}
	static try = async (callback: Function) => {
		try {
			await callback();
		} catch (error: unknown) {
			if (error instanceof ZodError) return error.errors.forEach(e => logger.error(e.message));
			if (typeof error === 'string') logger.error(error)
			if (error instanceof Error) logger.error(error.message);
			if (error instanceof TypeError)
				logger.error(error.message, 'Type Error');
			if (error instanceof GitlabApiError)
				logger.error(error.message, 'Gitlab Api Error');

			if(checkIsObject(error) && hasOwnProperty(error, 'stack') && checkIsString(error.stack)) {
				logger.stack(error.stack)
			}
		}
	};
}
export default ErrorHandler;
