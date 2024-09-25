import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';
import { SubscriptionPlan } from '@prisma/client';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';

@injectable()
export class SubscriptionRepository {
	private prisma: PrismaClientWrapper;

	constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
		this.prisma = prisma;
	}



	async findAll(): Promise<SubscriptionPlan[]> {
		return this.prisma.client.subscriptionPlan.findMany();
	}

	async create(data: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionPlan> {
		return this.prisma.client.subscriptionPlan.create({
			data,
		});
	}

	async update(id: string, data: Partial<Omit<SubscriptionPlan, 'id'>>): Promise<SubscriptionPlan | null> {
		try {
			return await this.prisma.client.subscriptionPlan.update({
				where: { id },
				data,
			});
		} catch (e: any) {
			if (e?.code == 'P2025') {
				throw new EntityNotFoundError('SubscriptionPlan', id);
			}
			throw new Error('Something went wrong while updating SubscriptionPlan Entity ' + e?.meta?.cause);
		}
	}

	async delete(id: string): Promise<string | null> {
		try {
			await this.prisma.client.subscriptionPlan.delete({
				where: { id },
			});
			return 'OK';
		} catch (e: any) {
			if (e?.code == 'P2025') {
				throw new EntityNotFoundError('SubscriptionPlan', id);
			}
			throw new Error('Something went wrong while deleting SubscriptionPlan Entity ' + e?.meta?.cause);
		}
	}

	async findOneById(id:string): Promise<SubscriptionPlan | null>{
		return this.prisma.client.subscriptionPlan.findUnique({
			where:{
				id
			}
		})
	}
}
