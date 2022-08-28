import { z } from 'zod';
import { execCommand } from '../utils/commands';
import Logger from './Logger';

type CommitOptions = {
  message?: string;
  add?: string;
};

class Git {
  static getBranchName = async (logger: Logger, path?: string) => {
    const command = 'git rev-parse --abbrev-ref HEAD';
    const data = await execCommand({ command, path, logger });
    const branchName = data.replace('\n', '');
    return z.string().parse(branchName);
  };

  static getProjectName = async (logger: Logger, path?: string) => {
    const command = 'git remote -v';
    const data = await execCommand({ command, path, logger });
    const [fetch, push] = data.split('\n');

    const fetchUrl = Git.getUrlFromGitRemote(fetch);
    const pushUrl = Git.getUrlFromGitRemote(push);

    const fetchProjectName = Git.getProjectNameFromUrl(fetchUrl);
    const pushProjectName = Git.getProjectNameFromUrl(pushUrl);

    if (fetchProjectName === pushProjectName) {
      const project = encodeURIComponent(pushProjectName);
      return project;
    }
    throw new Error('Fetch and push origin do not match. Could not deduce project name.');
  };

  static commit = async (options: CommitOptions, logger: Logger) => {
    const { message, add } = options;
    const canCommit = await Git.checkCanCommit(logger, add);
    if (!canCommit) return;
    let command = 'git commit';
    if (add === 'all') {
      command = 'git add . && git commit';
    } else if (add === 'tracked') {
      command = 'git commit -a';
    } else if (typeof add !== 'undefined') {
      throw new Error('when committing authorized "add" values are "all" to stage all files and "tracked" to stage only tracked files');
    }
    command = message ? `${command} -m` : command;
    await execCommand({ command, message, logger });
  };

  static pull = async (logger: Logger, branch?: string) => {
    const command = branch ? 'git pull origin' : 'git pull';
    await execCommand({ command, branch, logger });
  };

  static show = async (logger:Logger, branch: string, file: string) => {
    const command = 'git show';
    return execCommand({
      command,
      branch: `${branch}:`,
      pathToAppend: file,
      logger,
    });
  };

  static push = async (logger:Logger, branch?: string) => {
    const command = branch ? 'git push -u origin' : 'git push';
    await execCommand({ command, branch, logger });
  };

  static getOriginDomain = async (logger: Logger, path?: string) => {
    const command = 'git remote -v';
    const data = await execCommand({ command, path, logger });
    const [fetch, push] = data.split('\n');

    const fetchUrl = Git.getUrlFromGitRemote(fetch);
    const pushUrl = Git.getUrlFromGitRemote(push);

    const fetchOriginDomain = Git.getOriginDomainFromUrl(fetchUrl);
    const pushOriginDomain = Git.getOriginDomainFromUrl(pushUrl);

    if (fetchOriginDomain === pushOriginDomain) return pushOriginDomain;
    throw new Error('Fetch and push origin do not match. Could not deduce domain name.');
  };

  static getUrlFromGitRemote = (remote: unknown) => {
    const parsedRemote = z.string().parse(remote);
    const urlArray = parsedRemote.match(/^origin\t(.*) \((fetch|push)\)$/);
    const parsedUrlArray = z.array(z.string()).parse(urlArray);
    return parsedUrlArray[1];
  };

  static getProjectNameFromUrl = (url: unknown) => {
    const parsedUrl = z.string().parse(url);
    const projectNameArray = parsedUrl.match(/^.*:(.*)\.git$/);
    const parsedProjectNameArray = z.array(z.string()).parse(projectNameArray);
    return parsedProjectNameArray[1];
  };

  static getOriginDomainFromUrl = (url: unknown) => {
    const parsedUrl = z.string().parse(url);
    const originDomainArray = parsedUrl.match(/^git@(.*):.*\.git$/);
    const parsedDomainArray = z.array(z.string()).parse(originDomainArray);
    return parsedDomainArray[1];
  };

  static checkCanCommit = async (logger: Logger, add?: string) => {
    const command = 'git status';
    const response = await execCommand({ command, logger });
    const cleanTreeMessage = 'nothing to commit, working tree clean';
    const noStagedChangesMessage = 'no changes added to commit';
    const changesToCommitMessage = 'Changes to be committed';
    const changesNotCommittedMessage = 'Changes not staged for commit';
    const untrackedFiles = 'nothing added to commit but untracked files present';
    if (response.includes(cleanTreeMessage)) {
      if (logger) {
        const text = logger.text.shouldCommitTreeClean();
        const continueText = logger.text.continueNoCommit();
        await logger.warn(text, continueText);
      }
      return false;
    }
    if (response.includes(noStagedChangesMessage)) {
      if (add === 'all' || add === 'tracked') return true;
      if (logger) {
        const text = logger.text.shouldCommitNoChangeAdded();
        const continueText = logger.text.continueNoCommit();
        await logger.warn(text, continueText);
      }
      return false;
    }
    if (
      response.includes(changesNotCommittedMessage)
      && response.includes(changesToCommitMessage)
    ) {
      if (add === 'all') return true;
      if (logger) {
        const text = logger.text.shouldCommitSomeChangeNotAdded();
        const continueText = logger.text.continueCommitStaged();
        await logger.warn(text, continueText);
      }
      return true;
    }
    if (response.includes(untrackedFiles)) {
      if (add === 'all') return true;
      if (logger) {
        const text = logger.text.shouldCommitSomeFilesAreUntracked();
        const continueText = logger.text.continueWithoutCommittingUntracked();
        await logger.warn(text, continueText);
      }
      return true;
    }
    if (response.includes(changesToCommitMessage)) {
      return true;
    }
    throw new Error('could not get git status');
  };
}

export default Git;
