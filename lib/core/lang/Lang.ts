import langEN from './en';
import langFR from './fr';

class Lang {
  readonly language: typeof langEN;

  constructor(lang?: string) {
    if (lang?.match(/fr/i)) {
      this.language = langFR;
    }
    this.language = langEN;
  }
}

export default Lang;
