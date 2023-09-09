import { ArbitraryServiceType } from '../models/max-balance.model';

class ServiceProvider {
  private static _instance: ServiceProvider;

  static getInstance(): ServiceProvider {
    if (!ServiceProvider._instance) {
      ServiceProvider._instance = new ServiceProvider();
    }
    return ServiceProvider._instance;
  }

  serviceCollection: ArbitraryServiceType[] = [];

  async registerService<T>(interfaceType: Function, instance: T): Promise<ArbitraryServiceType> {
    const record = { interfaceType, instance };
    this.serviceCollection.push(record);
    return record;
  }

  async getService<T>(ClassConstructor: new (...args: any[]) => T, ...args: any[]): Promise<T> {
    let service: ArbitraryServiceType = this.serviceCollection.find((x) => x.interfaceType === ClassConstructor);
    if (service === undefined) {
      service = await this.registerService(ClassConstructor, new ClassConstructor(...args));
    }
    return service.instance as T;
  }
}
export default ServiceProvider.getInstance();
