import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Customer, Payment, SubscriptionPlan } from '@prisma/client';
import { CustomerRepository } from '../customers/customers.repository';
import { CustomerService } from '../customers/customers.service';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';
import { PaymentsRepository } from './payments.repository';
import { PaymentWebhookInput, PaymentWebhookStatus } from './dto/payment-webhook-input.dto';
import { InvoicePaymentStatus, InvoiceStatus } from '../invoices/types';
import { InvoicesService } from '../invoices/invoices.service';
import { NotificationService } from '../notifications/notification.service';

@injectable()
export class PaymentsService {
	constructor(
		@inject(TYPES.PaymentsRepository) private paymentsRepository: PaymentsRepository,
		@inject(TYPES.InvoicesService) private invoicesService: InvoicesService,
		@inject(TYPES.NotificationService) private notificationsService: NotificationService,
		@inject(TYPES.CustomerService) private customerService: CustomerService
	) {}

	async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'paymentDate'>){
		return this.paymentsRepository.createPayment(data)
	}	
	async getPayments(): Promise<Payment[]> {
		return this.paymentsRepository.getPayments();
	}
	async updatePayment(data: PaymentWebhookInput) {
		const updateData={
			paymentDate:data.paymentDate,
			amount:data.amount,
		}

		const updatedPayment=await this.paymentsRepository.updatePayment(data.paymentId,updateData);
		const customer=await this.customerService.findOne(data.customerId)
		
		if(!customer) throw new EntityNotFoundError('Customer',data.customerId)
		if(data.status==PaymentWebhookStatus.PAID){
			await this.invoicesService.updateInvoice(updatedPayment.invoiceId,{
				paymentDate:data.paymentDate,
				paymentStatus:InvoicePaymentStatus.PAID,
				status:InvoiceStatus.ISSUED
			})
			if(customer)
			await this.sendPaymentSuccessEmail(customer)
		
		}else{
			await this.sendFailedPaymentEmail(customer,data.paymentId)
			await this.invoicesService.updateInvoice(updatedPayment.invoiceId,{
				paymentStatus:InvoicePaymentStatus.FAILED				
			})
		}
		return updatedPayment
	}
	async sendFailedPaymentEmail(customer:Customer,paymentId:string) {
			if (customer) {
			await this.notificationsService.sendNotification({
				to: customer.email,
				subject: 'Subscription Payment',
				content: `Your payment has been failed try to pay with the following intent id: ${paymentId}`
			});
		}
	}
	async sendPaymentSuccessEmail(customer: Customer) {
		if (customer) {
			await this.notificationsService.sendNotification({
				to: customer.email,
				subject: 'Subscription Payment',
				content: `Your payment has been successful`
			});
		}
	}
}