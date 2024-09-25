import { Hono } from 'hono';
import { container } from '../../config/di-config';
import { TYPES } from '../../types';
import { InvoicesController } from './invoices.controller';


export class InvoicesHandler {
	static app: Hono | null = null;
	static routes() {
		if (this.app) {
			return this.app;
		}
		this.app = new Hono();

		const invoicesController = container.get<InvoicesController>(TYPES.InvoicesController);
		this.app.get('/webhook', async (ctx) => {
			return ctx.json([]);
		});

		this.app.get('/', async (ctx) => {
			return ctx.json(await invoicesController.getInvoices());
		});

		return this.app;
	}
}

