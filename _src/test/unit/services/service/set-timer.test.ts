import { ToadScheduler } from 'toad-scheduler';
import serviceProvider from '../../../../utils/service-provider.util';
import { MockedService } from './__mocks__/mocked-service';

describe('unit service.setTimer', () => {
  let mockedService: MockedService;

  beforeEach(() => {
    mockedService = new MockedService();
  });

  it('should resolve with an error message when the timer expires', async () => {
    const mockStop = jest.fn();
    const awaitingTime = 100;
    class MockedToadScheduler extends ToadScheduler {
      constructor() {
        super();
        this.stop = (): void => {
          mockStop();
          super.stop();
        };
      }
    }
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(new MockedToadScheduler());
    const result = await mockedService.setTimer(awaitingTime);

    expect(result).toEqual({ error: `the waiting time has expired! (${awaitingTime} msec)` });
    expect(mockStop).toHaveBeenCalled();
  });
});
