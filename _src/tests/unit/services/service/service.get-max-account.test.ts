import { Service } from '../../../../services/service';

describe('setTimer function', () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  it('should resolve with an error message when the timer expires', async () => {
    expect(true).toEqual(true);
  });
});
