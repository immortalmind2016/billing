import 'reflect-metadata';
import { IsNumber, IsString } from 'class-validator';
import { SubscriptionPlanInput } from './subscription-input.dto';
import { BillingCycle } from '../types';

export class SubscriptionPlan extends SubscriptionPlanInput {
	@IsString()
	id: string;

	constructor(id: string, name: string, billingCycle: BillingCycle, price: number, status: string) {
		super(name, billingCycle, price, status);
		this.id = id;
		this.name = name;
		this.billingCycle = billingCycle;
		this.price = price;
		this.status = status;
	}
}
