import 'reflect-metadata'; // Import at the very top of the file
import { Hono } from 'hono';
import { container } from './di-config';
import { TYPES } from './types';
import { SubscriptionController } from './modules/subscriptions/subscriptions.controller';




// Initialize the app
const app = new Hono();

// Get controllers from DI container

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {

		container.bind<Env>('Env').toConstantValue(env);

		const subscriptionController = container.get<SubscriptionController>(TYPES.SubscriptionController);


			app.get("/subscription-plans",async (ctx) =>{
				return ctx.json(await subscriptionController.list())
			});


    return app.fetch(request, env, ctx)
  },
}
