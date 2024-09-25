import { Context, Hono } from 'hono';
import { container } from '../../config/di-config';
import { TYPES } from '../../types';
import { PaymentsController } from './payments.controller';
import { validateDto } from '../../shared/middlewares/validator';
import { PaymentWebhookInput } from './dto/payment-webhook-input.dto';


export class PaymentsHandler {
	static app: Hono | null = null;
	static routes() {
		if (this.app) {
			return this.app;
		}
		this.app = new Hono();

		const paymentsController = container.get<PaymentsController>(TYPES.PaymentsController);
		this.app.post('/webhook',validateDto(PaymentWebhookInput,"body"), async (ctx) => {
			const data = await ctx.req.json();
			return ctx.json(await paymentsController.webhook(data));
		});
		this.app.get('/', async (ctx) => {
			return ctx.json(await paymentsController.getPayments());
		});

		return this.app;
	}
}

