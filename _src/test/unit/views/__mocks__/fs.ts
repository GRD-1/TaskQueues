import { mockedHtml } from './mocked-html';

export class Fs {
  readFileSync(path?: string, options?: string): string {
    return mockedHtml;
  }
}

export default new Fs();
