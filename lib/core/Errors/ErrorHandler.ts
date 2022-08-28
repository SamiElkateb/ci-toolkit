import { z, ZodError } from 'zod';
import Log from '../Logger';
import GitlabApiError from './GitlabApiError';

const logger = new Log();
class ErrorHandler {
  static try = async (callback: () => Promise<void>) => {
    try {
      await callback();
    } catch (error) {
      if (error instanceof ZodError) error.errors.forEach((e) => logger.error(e.message));
      if (typeof error === 'string') logger.error(error);
      if (error instanceof Error) logger.error(error.message);
      if (error instanceof TypeError) { logger.error(error.message, 'Type Error'); }
      if (error instanceof GitlabApiError) { logger.error(error.message, 'Gitlab Api Error'); }

      const parsedError = z.object({ stack: z.string() }).safeParse(error);
      if (parsedError.success) {
        logger.stack(parsedError.data.stack);
      }
    }
  };
}
export default ErrorHandler;
