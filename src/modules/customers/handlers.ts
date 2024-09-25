import { Context, Hono } from 'hono';
import { container } from '../../config/di-config';
import { TYPES } from '../../types';
import { validateDto } from '../../shared/middlewares/validator';
import { CustomerInput,CustomerLoginDto,CustomerUpdateDto } from './dto/customer-input.dto';
import { CustomerController } from './customers.controller';
import { jwtAuthMiddleware } from '../../shared/middlewares/auth';

export class CustomerHandler{
	static app:Hono | null=null;
	static routes(){
		if(this.app){
			return this.app
		}
		this.app = new Hono();

		const customerController = container.get<CustomerController>(TYPES.CustomerController);

		this.app.post('/signup',validateDto(CustomerInput,"body"), async (c) => {
			const data = await c.req.json();
			return c.json(await customerController.signup(data));
		});
		this.app.post('/login',validateDto(CustomerLoginDto,"body"), async (c) => {
			const data = await c.req.json();
			return c.json(await customerController.login(data));
		});
		this.app.put('/',jwtAuthMiddleware,validateDto(CustomerUpdateDto,"body"), async (c:Context) => {
			const data = await c.req.json();
			const id = c.get('userId'); // Retrieve the user ID from the context

			return c.json(await customerController.update(id,data));
		});
		this.app.get('/me',jwtAuthMiddleware, async (c:Context) => {
			const id = c.get('userId'); // Retrieve the user ID from the context
			return c.json(await customerController.find(id));
		});
		return this.app;
	}
}


