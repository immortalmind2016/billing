import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';
import { Payment } from '@prisma/client';

@injectable()
export class PaymentsRepository {
	private prisma: PrismaClientWrapper;

	constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
		this.prisma = prisma;
	}

	async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'paymentDate'>): Promise<Payment> {
		return this.prisma.client.payment.create({
			data:{
				...data,
				paymentDate: new Date(),
				invoiceId: data.invoiceId
			}
		});
	}
	async getPayments(): Promise<Payment[]> {
		return this.prisma.client.payment.findMany();
	}
	async updatePayment(id:string,data: Partial<Payment>) {
		return this.prisma.client.payment.update({
			where: {
				id,
			},
			data,
		});
	}
}
