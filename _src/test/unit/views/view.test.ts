import * as path from 'path';
import { MOCKED_RESULTS } from './__mocks__/mocked-results';
import { processedHtml } from './__mocks__/processed-html';
import View from '../../../views/view';
import { ProcessedData } from '../../../models/max-balance.model';
import config from './__mocks__/config';
// it is necessary to mock 'config' library here because we mock 'fs' library. 'config' doesn't work without 'fs' (!)
jest.mock('config');
jest.mock('fs');

describe('unit view max-balance', () => {
  it('should return a correct html string', async () => {
    const projectRoot = path.resolve(process.cwd());
    config.PROJECT_ROOT = projectRoot;
    class MockedView extends View {
      static logBenchmarks = jest.fn();
    }

    const result = await MockedView.getBalanceView(MOCKED_RESULTS);

    expect(MockedView.logBenchmarks).toBeCalledWith(MOCKED_RESULTS);
    expect(result).toEqual(processedHtml);
  });

  it('should return error message', async () => {
    class MockedView extends View {
      static logBenchmarks = (args: ProcessedData): void => {
        throw new Error('test error!');
      };
    }
    jest.spyOn(console, 'error').mockReturnValue(null);
    const result = await MockedView.getBalanceView(MOCKED_RESULTS);

    expect(result).toEqual('test error!');
  });
});
