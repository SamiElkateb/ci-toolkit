import { z } from 'zod';
import ERROR_MESSAGES from '../../constants/ErrorMessages';

class GitlabApiError extends Error {
  constructor(gitlabError: unknown) {
    try {
      const errorSchema = z.object({
        response: z.object({ data: z.unknown() }),
      }).passthrough();
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
    const messageInError = z.object({ error: z.string() }).safeParse(data);
    if (messageInError.success) {
      return messageInError.data.error;
    }

    const messageInMessage = z.object({ message: z.string() }).safeParse(data);
    if (messageInMessage.success) {
      return messageInMessage.data.message;
    }

    const messageInBase = z.object({
      message: z.object({ base: z.array(z.string()) }),
    }).safeParse(data);
    if (messageInBase.success) {
      return GitlabApiError.getMessageFromArray(messageInBase.data.message.base);
    }

    const messageInMessageArray = z.object({ message: z.array(z.string()) }).safeParse(data);
    if (messageInMessageArray.success) {
      return GitlabApiError.getMessageFromArray(messageInMessageArray.data.message);
    }
    return ERROR_MESSAGES.unknownGitlabApiError;
  };

  static getMessageFromArray = (messages: unknown) => {
    const messageInArray = z.array(z.string()).safeParse(messages);
    if (messageInArray.success) {
      return messageInArray.data.reduce((acc, currMessage) => (`${acc} \n ${currMessage}`));
    }
    return ERROR_MESSAGES.unknownGitlabApiError;
  };
}
export default GitlabApiError;
