import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { SubscriptionPlan } from './type';
import { SubscriptionRepository } from './subscriptions.repository';

@injectable()
export class SubscriptionService {
	constructor(@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository<SubscriptionPlan>) {}

	async list(): Promise<SubscriptionPlan[]> {
		return this.subscriptionRepository.findAll()
	}
}
