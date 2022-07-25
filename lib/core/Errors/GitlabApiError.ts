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

class GitlabApiError {
    readonly message: string;
    constructor(error: unknown) {
        try {
            const errorSchema = z.object({
                response: z.object({ data: z.string() }),
            });
            const parsedError = errorSchema.parse(error);
            this.message = GitlabApiError.getMessageFromData(
                parsedError.response.data
            );
        } catch (error) {
            this.message = ERROR_MESSAGES.unknownGitlabApiError;
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
            checkIsObject(data.message) &&
            hasOwnProperty(data.message, 'base')
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
