import { mockedHtml } from './mocked-html';

export class FS {
  readFileSync(path: string, options: string): string {
    return mockedHtml;
  }
}

export default new FS();
