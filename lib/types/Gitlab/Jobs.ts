export interface gitlabRunJobApiResponse {
    commit: gitlabCommit;
    coverage?: any;
    allow_failure: boolean;
    created_at: string;
    started_at: string | null;
    finished_at: string | null;
    duration: number | null;
    queued_duration: number | null;
    id: number;
    name: string;
    ref: string;
    artifacts: any[];
    runner: gitlabRunner | null;
    stage: string;
    status: string;
    tag: boolean;
    web_url: string;
    user: gitlabUser | null;
}

export interface gitlabCommit {
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

export interface gitlabUser {
    id: number;
    username: string;
    name: string;
    state: string;
    avatar_url: string;
    web_url: string;
}

export interface gitlabRunner {
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
        