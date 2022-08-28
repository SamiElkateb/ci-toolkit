import { TOKEN_PATH } from './paths';

export const STANDARD_CONFIG = {
  token: TOKEN_PATH,
  log_level: 'debug',
  domain: 'working-server.com',
  allow_insecure_certificates: false,
  warning_action: 'skip',
  lang: 'en',
};

export const GET_CURRENT_PROJECT_NAME = [{
  get_current_project_name: {
    store: '$_currentBranch',
  },
}];

export const GET_CURRENT_BRANCH_NAME = [{
  get_current_branch_name: {
    store: '$_currentProject',
  },
}];

export const CREATE_MERGE_REQUEST = [{
  get_current_branch_name: {
    store: '$_currentBranch',
  },
},
{
  get_current_project_name: {
    store: '$_currentProject',
  },
},
{
  create_merge_request: {
    title: '$_currentBranch',
    project: '$_currentProject',
    source_branch: '$_currentBranch',
    target_branch: 'main',
    await_pipeline: true,
    min_approvals: 0,
    assign_to_me: true,
    delete_source_branch: true,
    squash_commits: true,
    reviewers: ['JohnDoe'],
    label: 'test-label',
  },
}];
