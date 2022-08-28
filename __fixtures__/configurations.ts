import { TOKEN_PATH } from './paths';

export const STANDARD_CONFIG = {
  token: TOKEN_PATH,
  log_level: 'debug',
  domain: 'testUrl.com',
  allow_insecure_certificates: false,
  warning_action: 'skip',
  lang: 'en',
};

export const GET_CURRENT_PROJECT_NAME = {
  get_current_project_name: {
    store: '$_currentProject',
  },
};

export const GET_CURRENT_BRANCH_NAME = {
  get_current_branch_name: {
    store: '$_currentProject',
  },
};
