import { Hono } from 'hono';
import { container } from '../../config/di-config';
import { SubscriptionController } from './subscriptions.controller';
import { TYPES } from '../../types';
import { validateDto } from '../../shared/middlewares/validator';
import { SubscriptionPlanInput } from './dto/subscription-input.dto';

export class SubscriptionHandler{
	static app:Hono | null=null;
	static routes(){
		if(this.app){
			return this.app
		}
		this.app = new Hono();

		const subscriptionController = container.get<SubscriptionController>(TYPES.SubscriptionController);
		this.app.get('/plans', async (ctx) => {
			return ctx.json(await subscriptionController.list());
		});
		this.app.post('/plans',validateDto(SubscriptionPlanInput,"body"), async (c) => {
			const data = await c.req.json();
			return c.json(await subscriptionController.create(data));
		});
		return this.app;
	}
}


