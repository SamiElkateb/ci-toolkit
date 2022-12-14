interface MergeRequestsPostOptions extends GitlabApiOptions {
  title: string;
  targetBranch: string;
  sourceBranch: string;
  squashCommits: boolean;
  deleteSourceBranch: boolean;
  label?: string;
  assigneeId?: number;
  minApprovals: number;
  reviewerIds: number[];
}

interface GitlabApiOptions {
  allowInsecureCertificates?: boolean;
  protocole: string;
  domain: string;
  project: string;
  token: string;
}

interface PipelineVariable {
  key: string;
  value: string;
  type?: string;
}

type Source = 'push' | 'web' | 'trigger' | 'schedule' | 'api' | 'external' | 'pipeline' | 'chat' | 'webide' | 'merge_request_event' | 'external_pull_request_event' | 'parent_pipeline' | 'ondemand_dast_scan' | 'ondemand_dast_validation';
