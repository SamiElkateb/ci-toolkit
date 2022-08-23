import { z } from 'zod';
import ERROR_MESSAGES from '../../constants/ErrorMessages';
import {
  assertArray,
  assertObject,
  assertProperty,
  assertString,
} from '../../utils/assertions/baseTypeAssertions';
import {
  checkIsObject,
  checkIsString,
  hasOwnProperty,
} from '../../utils/validations/basicTypeValidations';

class GitlabApiError extends Error {
  constructor(gitlabError: unknown) {
    try {
      const errorSchema = z.object({
        response: z.object({ data: z.string() }),
      });
      const parsedError = errorSchema.parse(gitlabError);
      const message = GitlabApiError.getMessageFromData(
        parsedError.response.data,
      );
      super(message);
    } catch (error) {
      const message = ERROR_MESSAGES.unknownGitlabApiError;
      super(message);
    }
  }

  static getMessageFromData = (data: unknown) => {
    assertObject(data);
    if (hasOwnProperty(data, 'error')) {
      assertString(data.error);
      return data.error;
    }
    assertProperty(data, 'message');
    if (checkIsString(data.message)) {
      return data.message;
    }
    if (
      checkIsObject(data.message)
            && hasOwnProperty(data.message, 'base')
    ) {
      return GitlabApiError.getMessageFromArray(data.message.base);
    }
    return GitlabApiError.getMessageFromArray(data.message);
  };

  static getMessageFromArray = (messages: unknown) => {
    assertArray(messages);
    const message = messages[0];
    assertString(message);
    return message;
  };
}
export default GitlabApiError;
