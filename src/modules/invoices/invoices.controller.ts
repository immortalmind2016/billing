import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Get, Route, Body, Post, Path, Put, Delete } from '@tsoa/runtime';
import { HTTPException } from 'hono/http-exception';
import { CustomInternalError } from '../../shared/internal/custom.exceptions';
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
