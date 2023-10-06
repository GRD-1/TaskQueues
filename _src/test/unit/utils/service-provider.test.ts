import serviceProvider from '../../../utils/service-provider.util';

describe('unit util service-provider', () => {
  it('should return an instance of a registered service', () => {
    class MyTestService {
      method(): void {
        console.log('Hi there from MyTestService');
      }
    }
    const myTestService = serviceProvider.getService(MyTestService);
    expect(myTestService).toBeInstanceOf(MyTestService);
  });
});
