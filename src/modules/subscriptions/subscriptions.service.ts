import { inject, injectable } from 'inversify';
import { SubscriptionRepository } from './subscriptions.repository';
import { TYPES } from '../../types';
import { SubscriptionPlanInput } from './dto/subscription-input.dto';
import { SubscriptionPlan } from '@prisma/client';

@injectable()
export class SubscriptionService {
  constructor(@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository) {}

  async list(): Promise<SubscriptionPlan[]> {
    return this.subscriptionRepository.findAll();
  }

  async create(data: SubscriptionPlanInput): Promise<SubscriptionPlan> {
    return this.subscriptionRepository.create(data);
  }

  async update(id: string, data: Partial<Omit<SubscriptionPlanInput, 'id'>>): Promise<SubscriptionPlan | null> {
    return this.subscriptionRepository.update(id, data);
  }

  async delete(id: string): Promise<SubscriptionPlan | null> {
    return this.subscriptionRepository.delete(id);
  }
}
