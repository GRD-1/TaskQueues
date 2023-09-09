// import 'reflect-metadata';
// import serviceProvider from './service-provider.util';
//
// export function injectService<T>(target: NonNullable<unknown>, propKey: string): TypedPropertyDescriptor<any> {
//   const propType = Reflect.getMetadata('design:type', target, propKey);
//   const descriptor: TypedPropertyDescriptor<any> = {
//     get(): T {
//       return serviceProvider.getService(propType);
//     },
//     configurable: true,
//     enumerable: true,
//   };
//   Object.defineProperty(target, propKey, descriptor);
//   return descriptor;
// }
