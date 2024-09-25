import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { SubscriptionService } from './subscriptions.service';
import { SubscriptionPlan } from './dto/subscription-response.dto';
import { Get, Route, Body, Post, Path, Put, Delete, Security, Inject,   } from '@tsoa/runtime';
import { HTTPException } from 'hono/http-exception';
import { CustomInternalError } from '../../shared/internal/custom.exceptions';

@injectable()
@Route('/api/subscriptions')
export class SubscriptionController {
	constructor(@inject(TYPES.SubscriptionService) private subscriptionService: SubscriptionService) {}

	// List all subscription plans
	@Get('/plans')
	async list() {
		return this.subscriptionService.list();
	}

	// Create a new subscription plan
	@Post('/plans')
	async create(@Body() data: SubscriptionPlan) {
		return this.subscriptionService.create(data);
	}

	// Update an existing subscription plan
	@Put('/plans/{id}')
	async update(@Path() id: string, @Body() data: Partial<SubscriptionPlan>) {
		try{
		return (await this.subscriptionService.update(id, data))
		}
		catch (e: any) {
			console.log({EEEEEEEERROR:e})
			if (e instanceof CustomInternalError) {
				throw new HTTPException(404, { message: e.message });
			}
			throw new HTTPException(400, { message: e.message });
		}
	}

	// Delete a subscription plan
	@Delete('plans/{id}')
	async delete(@Path() id: string) {
		try {
			await this.subscriptionService.delete(id);
			return "Ok"
		} catch (e: any) {
			if (e instanceof CustomInternalError) {
				throw new HTTPException(404, { message: e.message });
			}
			throw new HTTPException(400, { message: e.message });
		}
	}

	@Post('/create')
	@Security('jwt')
	async subscribe(@Inject() customerId: string, @Body() id: string) {
		try{
			return await this.subscriptionService.subscribe(customerId, id);
		}
		catch (e: any) {
			if (e instanceof CustomInternalError) {
				throw new HTTPException(404, { message: e.message });
			}
			throw new HTTPException(400, { message: e.message });
		}
	}
}
