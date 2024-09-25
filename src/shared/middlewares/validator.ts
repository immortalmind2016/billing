import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Context } from 'hono';

type ValidationSource = 'body' | 'query' | 'param' ;

export function validateDto(dtoClass: any, source: ValidationSource) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      let data;

      if (source === 'body') {
        data = await c.req.json();
      } else if (source === 'query') {
        data = c.req.query();
      } else if (source === 'param') {
        data = c.req.param();
      }

      const dtoInstance = plainToInstance(dtoClass, data);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        return c.json({ errors }, 400);
      }

      c.set('validatedData', dtoInstance);
      await next();
    } catch (error) {
      console.log(error)
      return c.json({ message: 'Invalid input' }, 400);
    }
  };
}
