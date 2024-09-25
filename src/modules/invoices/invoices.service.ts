import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Customer, Invoice, SubscriptionPlan } from '@prisma/client';
import { CustomerRepository } from '../customers/customers.repository';
import { CustomerService } from '../customers/customers.service';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';
import { InvoicesRepository } from './invoices.repository';

@injectable()
export class InvoicesService {
	constructor(
		@inject(TYPES.InvoicesRepository) private invoicesRepository: InvoicesRepository,
	) {}

	async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) {
		return this.invoicesRepository.createInvoice(data);
	}

	async getInvoiceById(id: string) {
		return this.invoicesRepository.getInvoiceById(id);
	}

	async updateInvoice(id: string, data: Partial<Invoice>) {
		return this.invoicesRepository.updateInvoice(id, data);
	}

	async getInvoices() {
		return this.invoicesRepository.getInvoices();
	}
}
