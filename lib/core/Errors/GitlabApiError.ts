import {
	assertArray,
	assertObject,
	assertProperty,
	assertString,
} from '../../utils/assertions';

class GitlabApiError {
	readonly message: string;
	constructor(error: unknown) {
		try {
			assertObject(error);
			assertProperty(error, 'response');
			assertObject(error.response);
			assertProperty(error.response, 'data');
			assertObject(error.response.data);
			assertProperty(error.response.data, 'message');
			assertArray(error.response.data.message);
			const message = error.response.data.message[0];
			assertString(message);
			this.message = message;
		} catch (error) {
			this.message = `Unknown Gitlab Api error`;
		}
	}
}
export default GitlabApiError;
