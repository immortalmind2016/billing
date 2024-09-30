

export function RemoveFields(fields: string[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      if (Array.isArray(result)) {
        return result.map(item => removeFieldsFromObject(item, fields));
      } else if (typeof result === 'object' && result !== null) {
        return removeFieldsFromObject(result, fields);
      }

      return result;
    };

    return descriptor;
  };
}

function removeFieldsFromObject(obj: any, fields: string[]): any {
  const newObj = { ...obj };
  fields.forEach(field => {
    delete newObj[field];
  });
  return newObj;
}
