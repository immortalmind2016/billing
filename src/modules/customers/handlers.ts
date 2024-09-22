import { Hono } from 'hono';
import { container } from '../../config/di-config';
import { TYPES } from '../../types';
import { validateDto } from '../../shared/middlewares/validator';
import { CustomerInput,CustomerUpdateDto } from './dto/customer-input.dto';
import { CustomerController } from './customers.controller';
import { Customer } from '@prisma/client';
import { QueryParamDto } from '../../shared/dto/query.dto';

export class CustomerHandler{
	static app:Hono | null=null;
	static routes(){
		if(this.app){
			return this.app
		}
		this.app = new Hono();

		const subscriptionController = container.get<CustomerController>(TYPES.CustomerController);
		this.app.get('/', async (ctx) => {
			return ctx.json(await subscriptionController.list());
		});
		this.app.post('/',validateDto(CustomerInput,"body"), async (c) => {
			const data = await c.req.json();
			return c.json(await subscriptionController.create(data));
		});
		this.app.put('/:id',validateDto(CustomerUpdateDto,"body"),validateDto(QueryParamDto,"param"), async (c) => {
			const data = await c.req.json();
			const id = c.req.param('id')

			return c.json(await subscriptionController.update(id,data));
		});
		this.app.delete('/:id',validateDto(QueryParamDto,"param"), async (c) => {
			const id = c.req.param('id')
			return c.json(await subscriptionController.delete(id));
		});
		return this.app;
	}
}


