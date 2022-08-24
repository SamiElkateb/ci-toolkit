import { z } from 'zod';
import ERROR_MESSAGES from '../constants/ErrorMessages';

export default z
  .object({
    project: z.string({
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'project',
      ),
    }),
    protocole: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'protocole',
        ),
      }),
    domain: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'domain',
        ),
      }),
    allowInsecureCertificates: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'allow_insecure_certificates',
        ),
      }),
    token: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'token',
        ),
      }),

  });
