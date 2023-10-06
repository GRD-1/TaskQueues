import { MockedFastqService } from './__mocks__/mocked-fastq-service';

describe('unit fastq.processData', () => {
  let mockedFastqService: MockedFastqService;
  let mockProcessQueue: typeof mockedFastqService.processQueue;

  beforeEach(() => {
    mockedFastqService = new MockedFastqService();
    mockProcessQueue = mockedFastqService.processQueue;
  });

  it('should set up the drain callback and return the processing time', async () => {
    const startTime = Date.now();
    const result = await mockedFastqService.processData();

    expect(mockProcessQueue.drain).toBeInstanceOf(Function);
    expect(mockProcessQueue.resume).toHaveBeenCalled();
    const actualProcessingTime = (Date.now() - startTime) / 1000;
    expect(result).toBeCloseTo(actualProcessingTime, 1);
  });
});
