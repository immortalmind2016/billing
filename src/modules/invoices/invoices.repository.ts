import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';
import { Invoice, SubscriptionPlan } from '@prisma/client';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';
import { InvoicePaymentStatus } from './types';

@injectable()
export class InvoicesRepository {
	private prisma: PrismaClientWrapper;

	constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
		this.prisma = prisma;
	}
	async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) {
		return this.prisma.client.invoice.create({
			data: {
				...data,
				paymentStatus: InvoicePaymentStatus.PENDING,
			},
		});
	}

	async getInvoiceById(id: string) {
		return this.prisma.client.invoice.findUnique({
			where: {
				id,
			},
		});
	}
	async updateInvoice(id: string, data: Partial<Invoice>) {
		return this.prisma.client.invoice.update({
			where: {
				id,
			},
			data,
		});
	}
	async getInvoices() {
		return this.prisma.client.invoice.findMany();
	}

}
