import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Get, Route, Body, Post} from '@tsoa/runtime';
import { PaymentsService } from './payments.service';
import { Payment } from '@prisma/client';
import { PaymentWebhookInput } from './dto/payment-webhook-input.dto';
import { NotificationService } from '../notifications/notification.service';
import { CustomerService } from '../customers/customers.service';

@injectable()
@Route('/api/payments')
export class PaymentsController {
	constructor(@inject(TYPES.PaymentsService) private paymentsService: PaymentsService,
		@inject(TYPES.NotificationService) private notificationService: NotificationService,
		@inject(TYPES.CustomerService) private customersService: CustomerService) {}

	@Get('/')
	async getPayments(): Promise<Payment[]> {
		return this.paymentsService.getPayments();
	}

	@Post('/webhook')
	async webhook(@Body() data: PaymentWebhookInput) {
		await this.paymentsService.updatePayment(data)
		return {
			success:true
		}
	}
}
