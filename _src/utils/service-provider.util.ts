export class ServiceProvider {
  private static _instance: ServiceProvider;

  static getInstance(): ServiceProvider {
    if (!ServiceProvider._instance) {
      ServiceProvider._instance = new ServiceProvider();
    }
    return ServiceProvider._instance;
  }

  getService<T>(ClassConstructor: new (...args: any[]) => T, ...args: any[]): T {
    return new ClassConstructor(...args) as T;
  }
}
export default ServiceProvider.getInstance();
