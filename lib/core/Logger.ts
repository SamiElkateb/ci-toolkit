/* eslint-disable no-console */
import assertContinue from '../utils/assertions/assertContinue';
import { assertProperty } from '../utils/assertions/baseTypeAssertions';
import standby from '../utils/standby';
import {
  checkIsArray,
  checkIsObject,
  checkIsStrictObject,
} from '../utils/validations/basicTypeValidations';
import Lang from './lang/Lang';

type DiffsLog = {
  add: unknown;
  remove: unknown;
  update: unknown;
};

class Logger {
  private green: string;

  private red: string;

  private yellow: string;

  private bright: string;

  private logLevel: logLevel;

  private warningAction: warningAction;

  public text: Lang['language'];

  constructor(logLevel?: string, warningAction?: string) {
    const lang = new Lang();
    this.green = '\x1b[32m%s\x1b[0m';
    this.red = '\x1b[31m%s\x1b[0m';
    this.yellow = '\x1b[33m%s\x1b[0m';
    this.bright = '\x1b[1m%s\x1b[0m';
    this.logLevel = 'info';
    this.warningAction = 'prompt';
    this.setLogLevel(logLevel);
    this.setWarningAction(warningAction);
    this.text = lang.language;
  }

  setLogLevel = (logLevel?: string) => {
    if (logLevel === 'debug') {
      this.logLevel = 'debug';
      return;
    }
    if (logLevel === 'warn') {
      this.logLevel = 'warn';
      return;
    }
    if (logLevel === 'error') {
      this.logLevel = 'error';
      return;
    }
    this.logLevel = 'info';
  };

  setWarningAction = (warningAction?: string) => {
    if (warningAction === 'skip') {
      this.warningAction = 'skip';
      return;
    }
    if (warningAction === 'standby') {
      this.warningAction = 'standby';
      return;
    }
    this.warningAction = 'prompt';
  };

  setLang = (language?: string) => {
    const lang = new Lang(language);
    this.text = lang.language;
  };

  error(text: string, errorType?: string) {
    if (typeof errorType !== 'undefined') {
      console.error(this.red, `${errorType}: ${text}`);
    } else {
      console.error(this.red, `Error: ${text}`);
    }
  }

  async warn(text: string, continuePrompt: string) {
    if (this.logLevel !== 'info' && this.logLevel !== 'debug' && this.logLevel !== 'warn') {
      return;
    }
    console.warn(this.yellow, `warn: ${text}`);
    if (this.warningAction === 'skip') return;
    if (this.warningAction === 'standby') {
      console.info('info: Standing by for 1 minute');
      await standby(60000);
      return;
    }
    await assertContinue(continuePrompt);
  }

  info(text: string) {
    if (this.logLevel !== 'info' && this.logLevel !== 'debug') return;
    console.info(this.bright, `Info: ${text}`);
  }

  debug(text: string) {
    if (this.logLevel !== 'debug') return;
    console.debug(`Debug: ${text}`);
  }

  // eslint-disable-next-line class-methods-use-this
  stack(text: string) {
    const textWithoutError = text.replace(/.*\n/, 'Stack: \n');
    console.log(textWithoutError);
  }

  diffs(inputDifs: DiffsLog) {
    const diffs = inputDifs;
    if (checkIsStrictObject(diffs.add)) {
      diffs.add = [diffs.add];
    }
    if (checkIsStrictObject(diffs.remove)) {
      diffs.remove = [diffs.remove];
    }
    if (checkIsStrictObject(diffs.update)) {
      diffs.update = [diffs.update];
    }
    const { add, remove, update } = diffs;
    this.info('Diffs test:');
    if (checkIsArray(add)) {
      console.info(this.green, '\t Add:');
      add.forEach((diff: unknown) => {
        if (checkIsObject(diff)) {
          const keysArray = Object.keys(diff);
          keysArray.forEach((key) => {
            assertProperty(diff, key);
            const path = key.replace(/\.([0-9]+)/, '[$1]');
            console.info(`\t + ${path}: ${diff[key]}`);
          });
        }
      });
    }
    if (checkIsArray(remove)) {
      console.info(this.red, '\t Remove:');
      remove.forEach((diff: unknown) => {
        if (checkIsObject(diff)) {
          const keysArray = Object.keys(diff);
          keysArray.forEach((key) => {
            assertProperty(diff, key);
            const path = key.replace(/\.([0-9]+)/, '[$1]');
            console.info(`\t - ${path}: ${diff[key]}`);
          });
        }
      });
    }
    if (checkIsArray(update)) {
      console.info(this.yellow, '\t Update:');
      update.forEach((diff: unknown) => {
        if (checkIsObject(diff)) {
          const keysArray = Object.keys(diff);
          keysArray.forEach((key) => {
            assertProperty(diff, key);
            const path = key.replace(/\.([0-9]+)/, '[$1]');
            console.info(`\t \u2213 ${path}: ${diff[key]}`);
          });
        }
      });
    }
  }

  request(url: string, type?: string) {
    if (this.logLevel !== 'debug') return;
    const obfuscatedTokenUrl = url.replace(
      /access_token=.*/,
      'access_token=*****-********************',
    );
    if (typeof type !== 'undefined') {
      console.debug(`Debug: sending ${type} request to ${obfuscatedTokenUrl}`);
    } else {
      console.debug(`Debug: sending request to ${obfuscatedTokenUrl}`);
    }
  }
}
export default Logger;
