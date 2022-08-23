const langEN = {
  help: `npx ci-toolkit <command>
Commands:
\t\t help
\t\t init \t\t initializes ci-toolkit by creating default config files`,
  currentBranchIs: (branch: string) => `current branch is ${branch}`,
  noMergeRequest: (branch: string) => `no merge request associated with branch ${branch}`,
  foundMr: (mergeRequest: string) => `found merge request titled ${mergeRequest} associated with current branch`,
  mrMeetsRequirements: (mergeRequest: string) => `${mergeRequest} meets merging requirements`,
  merging: (sourceBranch: string, targetBranch: string) => `merging ${sourceBranch} to ${targetBranch}`,
  currentTag: (tag: string) => `current tag is ${tag}`,
  newTag: (tag: string) => `new tag is ${tag}`,
  noUser: (username: string) => `user ${username} does not exist`,
  shouldCommitTreeClean: () => 'Should commit but the working tree is clean.',
  shouldCommitNoChangeAdded: () => 'Should commit but there is no changes added to commit.',
  shouldCommitSomeChangeNotAdded: () => 'Should commit but some changes are not staged for commit.',
  continueNoCommit: () => 'Continue without committing?',
  continueCommitStaged: () => 'Continue and commit only staged changes?',
  undefinedToken: () => 'Token is not defined',
  undefinedProtocole: () => 'Protocole is not defined',
  undefinedDomain: () => 'Domain name is not defined',
  undefinedProject: () => 'Project name is not defined',
};

export default langEN;
