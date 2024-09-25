import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Get, Route } from '@tsoa/runtime';
import { InvoicesService } from './invoices.service';
import { Invoice } from '@prisma/client';

@injectable()
@Route('/api/invoices')
export class InvoicesController {
	constructor(@inject(TYPES.InvoicesService) private invoicesService: InvoicesService) {}

	@Get('/')
	async getInvoices(): Promise<Invoice[]> {
		return this.invoicesService.getInvoices();
	}

}
