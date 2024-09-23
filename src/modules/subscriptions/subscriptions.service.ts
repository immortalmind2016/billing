import { inject, injectable } from 'inversify';
import { SubscriptionRepository } from './subscriptions.repository';
import { TYPES } from '../../types';
import { SubscriptionPlanInput } from './dto/subscription-input.dto';
import { Customer, SubscriptionPlan } from '@prisma/client';
import { CustomerRepository } from '../customers/customers.repository';
import { CustomerService } from './../customers/customers.service';
import { SubscriptionPlanStatus } from './types';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';

@injectable()
export class SubscriptionService {
	constructor(
		@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository,
		@inject(TYPES.CustomerService) private CustomerService: CustomerService
	) {}

	async list(): Promise<SubscriptionPlan[]> {
		return this.subscriptionRepository.findAll();
	}

	async findOneById(id: string): Promise<SubscriptionPlan|null> {
		return this.subscriptionRepository.findOneById(id);
	}

	async create(data: SubscriptionPlanInput): Promise<SubscriptionPlan> {
		return this.subscriptionRepository.create(data);
	}

	async update(id: string, data: Partial<Omit<SubscriptionPlanInput, 'id'>>): Promise<SubscriptionPlan | null> {
		return this.subscriptionRepository.update(id, data);
	}

	async delete(id: string): Promise<string | null> {
		return this.subscriptionRepository.delete(id);
	}

	async subscribe(customerId: string, id: string): Promise<Customer> {
		const customer = await this.CustomerService.findOne(customerId);

		if (!customer) {
			throw new EntityNotFoundError('Customer',customerId);
		}

		const plan = await this.subscriptionRepository.findOneById(id);

		if (!plan) {
			throw new EntityNotFoundError('SubscriptionPlan',id);
		}

		customer.subscriptionPlanId = plan.id;
		customer.subscriptionStatus = SubscriptionPlanStatus.active;
		customer.subscriptionStartData= new Date()

		await this.CustomerService.update(customer.id,customer);

		//TODO: add payment logic

		return customer;
	}
}
