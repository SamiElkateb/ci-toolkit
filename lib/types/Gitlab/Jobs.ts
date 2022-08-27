// Jobs
export interface GitlabFetchSingleJob {
  commit: GitlabCommit;
  coverage?: unknown;
  allow_failure: boolean;
  created_at: string;
  started_at: string;
  finished_at: string;
  duration: number;
  queued_duration: number;
  artifacts_expire_at: string;
  tag_list: string[];
  id: number;
  name: string;
  pipeline: GitlabPipeline;
  ref: string;
  artifacts: unknown[];
  runner: null;
  stage: string;
  status: string;
  tag: boolean;
  web_url: string;
  user: GitlabUser;
}
export interface GitlabRunJobApiResponse {
  commit: GitlabCommit;
  coverage?: unknown;
  allow_failure: boolean;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration: number | null;
  queued_duration: number | null;
  id: number;
  name: string;
  ref: string;
  artifacts: unknown[];
  runner: GitlabRunner | null;
  stage: string;
  status: string;
  tag: boolean;
  web_url: string;
  user: GitlabUser | null;
}

// Others
export interface GitlabCommit {
  id: string;
  short_id: string;
  title: string;
  author_name: string;
  author_email: string;
  authored_date?: string;
  committer_name?: string;
  committer_email?: string;
  committed_date?: string;
  created_at: string;
  message: string;
  parent_ids?: string[];
  web_url?: string;
}

export interface GitlabUser {
  id: number;
  username: string;
  name: string;
  state: string;
  avatar_url: string;
  web_url: string;
}

export interface GitlabRunner {
  active: boolean;
  paused: boolean;
  description: string;
  id: number;
  ip_address: string;
  is_shared: boolean;
  runner_type: string;
  name: string | null;
  online: boolean;
  status: string;
}

export interface GitlabPipeline {
  id: number;
  project_id: number;
  ref: string;
  sha: string;
  status: string;
}
