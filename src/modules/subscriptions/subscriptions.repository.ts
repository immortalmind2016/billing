import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';
import { SubscriptionPlan } from '@prisma/client';

@injectable()
export class SubscriptionRepository {
  private prisma: PrismaClientWrapper;

  constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
    this.prisma = prisma;
  }

  async findAll(): Promise<SubscriptionPlan[]> {
    return this.prisma.client.subscriptionPlan.findMany();
  }

  async create(data: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    return this.prisma.client.subscriptionPlan.create({
      data,
    });
  }

  async update(id: string, data: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan | null> {
    return this.prisma.client.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<SubscriptionPlan | null> {
    return this.prisma.client.subscriptionPlan.delete({
      where: { id },
    });
  }
}
