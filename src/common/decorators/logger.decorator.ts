import { Injectable, Logger } from '@nestjs/common';

export function LogMethodCall() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = function (...args: any[]) {
      logger.log(
        `STARTS Method ${propertyKey} was called with arguments: ${JSON.stringify(args)}`,
      );
      const result = originalMethod.apply(this, args);
      logger.log(
        `ENDS Method ${propertyKey} returned: ${JSON.stringify(result)}`,
      );
      return result;
    };

    return descriptor;
  };
}
