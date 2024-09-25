import 'reflect-metadata'; // Import at the very top of the file
import { ExecutionContext, Hono } from 'hono';
import { container } from './config/di-config';
import { SubscriptionHandler } from './modules/subscriptions/handlers';
import swaggerDoc from '../build/swagger.json';
import { CustomerHandler } from './modules/customers/handlers';
import { InvoicesHandler } from './modules/invoices/handlers';
import { PaymentsHandler } from './modules/payments/handlers';
import { retryFailedPayment } from './jobs/retry-failed-payment';
import { autoBilling } from './jobs/auto-billing';
import { autoInactiveSubscription } from './jobs/auto-inactive-subscription';

class App {
	static app = new Hono();
	static isDefinedRoutes = false;

	static start() {
		const app = this.app;

		return {
			fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
				if (!this.isDefinedRoutes) {

					container.bind('Env').toConstantValue(env);
						console.log({EEEEEEE:env})
					this. app.get('/api-docs', (c) => {
						return c.html(`
							<html>
								<head>
									<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.51.1/swagger-ui.css" >
									<script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.51.1/swagger-ui-bundle.js"> </script>
									<script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/3.51.1/swagger-ui-standalone-preset.js"> </script>
								</head>
								<body>
									<div id="swagger-ui"></div>
									<script>
										const ui = SwaggerUIBundle({
											url: '/swagger.json', // This will serve your swagger.json
											dom_id: '#swagger-ui',
											presets: [
												SwaggerUIBundle.presets.apis,
												SwaggerUIStandalonePreset
											],
											layout: "StandaloneLayout"
										});
									</script>
								</body>
							</html>
						`);
					});

				app.get('/swagger.json', (c) => {
				return c.json(swaggerDoc);
				});

				app.route('/api/subscriptions', SubscriptionHandler.routes());
				app.route('/api/customers', CustomerHandler.routes());
				app.route('/api/invoices', InvoicesHandler.routes());
				app.route('/api/payments', PaymentsHandler.routes());


				this.isDefinedRoutes = true;
				}


				return app.fetch(request, env, ctx);
			},
			scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
				console.log('Scheduled event triggered');
				ctx.waitUntil(
					Promise.all([
						retryFailedPayment(env),
						autoBilling(env),
						autoInactiveSubscription(env)
					])
				);
				
			  },
		};
	}
}

export default App.start();
