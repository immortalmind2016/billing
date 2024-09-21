import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';

@injectable()
export class SubscriptionRepository<T> {

	private prisma: PrismaClientWrapper;

	constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
		this.prisma = prisma;
	}

	 // Find all Subscription Plans
	 async findAll(): Promise<SubscriptionPlan[]> {
		return this.prisma.client.subscriptionPlan.findMany();
	  }

	//   findById(id: string) {
	//     return this.model.findById(id).exec();
	//   }

	//   create(data: any) {
	//     return this.model.create(data);
	//   }
}
