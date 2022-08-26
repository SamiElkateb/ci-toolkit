import { CONFIG_PATH, TOKEN_PATH } from './paths';

const STANDARD_CONFIG = {
  token: TOKEN_PATH,
  log_level: 'debug',
  domain: 'testUrl.com',
  allow_insecure_certificates: true,
  warning_action: 'skip',
  lang: 'en',
  commands: COMMANDS,
};

export { STANDARD_CONFIG, COMMANDS };
