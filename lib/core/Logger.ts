/* eslint-disable no-console */
import { z } from 'zod';
import assertContinue from '../utils/assertContinue';
import standby from '../utils/standby';
import Lang from './lang/Lang';

type DiffsLog = {
  add: unknown;
  remove: unknown;
  update: unknown;
};
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type WarningAction = 'prompt' | 'standby' | 'skip';
interface DataForDiffLog {
  diffs: unknown;
  name: string;
  color: string;
  sign: string;
}

class Logger {
  private green: string;

  private red: string;

  private yellow: string;

  private bright: string;

  private logLevel: LogLevel;

  private warningAction: WarningAction;

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
    const { add, remove, update } = diffs;
    this.info('Diffs:');
    Logger.logDiffs({
      diffs: add,
      name: 'Add',
      color: this.green,
      sign: '+',
    });
    Logger.logDiffs({
      diffs: remove,
      name: 'Remove',
      color: this.red,
      sign: '-',
    });
    Logger.logDiffs({
      diffs: update,
      name: 'Update',
      color: this.yellow,
      sign: '\u2213',
    });
  }

  private static logDiffs = (data: DataForDiffLog) => {
    const {
      diffs, color, name, sign,
    } = data;
    const parsedDiffObject = z.array(z.object({})).safeParse(diffs);
    if (parsedDiffObject.success) {
      console.info(color, `\t ${name}:`);
      parsedDiffObject.data.forEach((diff) => {
        const keysArray = Object.keys(parsedDiffObject.data);
        keysArray.forEach((key) => {
          const parsedDiff = z.object({ [key]: z.string() }).parse(diff);
          const path = key.replace(/\.([0-9]+)/, '[$1]');
          console.info(`\t ${sign} ${path}: ${parsedDiff[key]}`);
        });
      });
    }
  };

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
