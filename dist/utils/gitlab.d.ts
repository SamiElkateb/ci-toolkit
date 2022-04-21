declare const axios: any;
declare const https: any;
declare const agent: any;
declare const getTags: ({ domain, token, projectId }: {
    domain: any;
    token: any;
    projectId: any;
}) => Promise<any>;
declare const getLastTag: ({ domain, token, projectId }: {
    domain: any;
    token: any;
    projectId: any;
}) => Promise<any>;
declare const getMergeRequests: ({ domain, token, projectId }: {
    domain: any;
    token: any;
    projectId: any;
}) => Promise<any>;
declare const getMergeRequest: ({ domain, token, projectId, sourceBranch }: {
    domain: any;
    token: any;
    projectId: any;
    sourceBranch: any;
}) => Promise<any>;
