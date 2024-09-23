import { Context, Hono } from 'hono';
import { container } from '../../config/di-config';
import { SubscriptionController } from './subscriptions.controller';
import { TYPES } from '../../types';
import { validateDto } from '../../shared/middlewares/validator';
import { CreateCustomerSubscriptionDto, SubscriptionPlanInput, SubscriptionUpdateDto } from './dto/subscription-input.dto';
import { QueryParamDto } from '../../shared/dto/query.dto';
import { HTTPException } from 'hono/http-exception';
import { CustomInternalError } from '../../shared/internal/custom.exceptions';
import { jwtAuthMiddleware } from '../../shared/middlewares/auth';

export class SubscriptionHandler {
	static app: Hono | null = null;
	static routes() {
		if (this.app) {
			return this.app;
		}
		this.app = new Hono();

		const subscriptionController = container.get<SubscriptionController>(TYPES.SubscriptionController);
		this.app.get('/plans', async (ctx) => {
			return ctx.json(await subscriptionController.list());
		});
		this.app.post('/plans', validateDto(SubscriptionPlanInput, 'body'), async (c) => {
			const data = await c.req.json();
			return c.json(await subscriptionController.create(data));
		});
		this.app.put('/plans/:id', validateDto(SubscriptionUpdateDto, 'body'), validateDto(QueryParamDto, 'param'), async (c) => {
			const data = await c.req.json();
			const id = c.req.param('id');
			return c.json(await subscriptionController.update(id, data));
		});
		this.app.delete('/plans/:id', validateDto(QueryParamDto, 'param'), async (c) => {
			const id = c.req.param('id');
			return c.json(await subscriptionController.delete(id));
		});

		this.app.post('/create',jwtAuthMiddleware, validateDto(CreateCustomerSubscriptionDto, 'body'), async (c:Context) => {
			const data =await c.req.json();
			const customerId=c.get("userId")


			return c.json(await subscriptionController.subscribe(customerId,data.id));
		});
		return this.app;
	}
}

