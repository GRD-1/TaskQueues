import { MOCKED_RESULTS } from './__mocks__/mocked-results';
import { processedHtml } from './__mocks__/processed-html';
import View from '../../../views/max-balance.view';
import { ProcessedData } from '../../../models/max-balance.model';
jest.mock('config');
jest.mock('fs');

describe('unit view max-balance', () => {
  it('should return a correct html string', async () => {
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
