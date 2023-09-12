import { ToadScheduler, Task, SimpleIntervalJob } from 'toad-scheduler';
import serviceProvider from '../../../../utils/service-provider.util';
import { Service } from '../../../../services/service';

describe('setTimer function', () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  it('should resolve with an error message when the timer expires', async () => {
    const mockStop = jest.fn();
    const mockAddJob = jest.fn();
    const mockScheduler = {
      stop: mockStop,
      addSimpleIntervalJob: mockAddJob,
    };
    jest.spyOn(serviceProvider, 'getService').mockReturnValue(mockScheduler);

    // Set the awaiting time (e.g., 1000 milliseconds)
    const awaitingTime = 1000;

    // Call the setTimer function
    const timerPromise = service.setTimer(awaitingTime);

    // Advance Jest's timers by the awaitingTime (1000 milliseconds)
    jest.advanceTimersByTime(awaitingTime);

    // Wait for the promise to resolve
    const result = await timerPromise;

    // Assertions
    expect(result).toEqual({ error: `the waiting time has expired! (${awaitingTime} msec)` });
    expect(mockStop).toHaveBeenCalled(); // Ensure scheduler.stop was called
    expect(mockAddJob).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
  });
});
