import {
	assertArray,
	assertObject,
	assertProperty,
	assertString,
} from '../../utils/assertions/baseTypeAssertions';
import {
	checkIsObject,
	hasOwnProperty,
} from '../../utils/validations/basicTypeValidations';

class GitlabApiError {
	readonly message: string;
	constructor(error: unknown) {
		try {
			assertObject(error);
			assertProperty(error, 'response');
			assertObject(error.response);
			assertProperty(error.response, 'data');
			this.message = GitlabApiError.getMessageFromData(
				error.response.data
			);
		} catch (error) {
			this.message = `Unknown Gitlab Api error`;
		}
	}
	static getMessageFromData = (data: unknown) => {
		assertObject(data);
		if (hasOwnProperty(data, 'error')) {
			assertString(data.error);
			return data.error;
		}
		assertProperty(data, 'message');
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
