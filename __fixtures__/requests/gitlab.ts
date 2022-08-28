const createMergeRequest = JSON.stringify({
  source_branch: 'new-branch',
  target_branch: 'master',
  title: 'new-branch',
  assignee_id: 11223344,
  reviewer_ids: [11223344],
  approvals_before_merge: 0,
  remove_source_branch: true,
  squash: true,
  labels: 'test-label',
});

const GITLAB_EXPECTED_REQUEST_BODY = {
  createMergeRequest,
};
export default GITLAB_EXPECTED_REQUEST_BODY;
