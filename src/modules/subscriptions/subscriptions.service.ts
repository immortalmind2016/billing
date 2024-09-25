import { inject, injectable } from 'inversify';
import { SubscriptionRepository } from './subscriptions.repository';
import { TYPES } from '../../types';
import { SubscriptionPlanInput } from './dto/subscription-input.dto';
import { Customer, SubscriptionPlan } from '@prisma/client';
import { CustomerRepository } from '../customers/customers.repository';
import { CustomerService } from './../customers/customers.service';
import { BillingCycle, SubscriptionPlanStatus } from './types';
import { EntityNotFoundError } from '../../shared/internal/database.exceptions';
import { InvoicePaymentStatus, InvoiceStatus } from '../invoices/types';
import { InvoicesService } from '../invoices/invoices.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod } from '../payments/types';
import { NotificationService } from '../notifications/notification.service';

@injectable()
export class SubscriptionService {
	constructor(
		@inject(TYPES.SubscriptionRepository) private subscriptionRepository: SubscriptionRepository,
		@inject(TYPES.CustomerService) private CustomerService: CustomerService,
		@inject(TYPES.InvoicesService) private invoicesService: InvoicesService,
		@inject(TYPES.PaymentsService) private paymentsService: PaymentsService,
		@inject(TYPES.NotificationService) private notificationsService: NotificationService
	) {}

	async list(): Promise<SubscriptionPlan[]> {
		return this.subscriptionRepository.findAll();
	}

	async findOneById(id: string): Promise<SubscriptionPlan|null> {
		return this.subscriptionRepository.findOneById(id);
	}

	async create(data: SubscriptionPlanInput): Promise<SubscriptionPlan> {
		return this.subscriptionRepository.create(data);
	}

	async update(id: string, data: Partial<Omit<SubscriptionPlanInput, 'id'>>): Promise<SubscriptionPlan | null> {
		return this.subscriptionRepository.update(id, data);
	}

	async delete(id: string): Promise<string | null> {
		return this.subscriptionRepository.delete(id);
	}

	async subscribe(customerId: string, newPlanId: string): Promise<{intentId: string}> {
		const customer = await this.CustomerService.findOne(customerId);

		if (!customer) {
			throw new EntityNotFoundError('Customer',customerId);
		}

		const newPlan = await this.subscriptionRepository.findOneById(newPlanId);

		if (!newPlan) {
			throw new EntityNotFoundError('SubscriptionPlan',newPlanId);
		}
	
		const { adjustedAmount, dueDate } = await this.calculateInvoiceDetails(customer, newPlan);

		// Create invoice with adjusted amount
		const invoice = await this.invoicesService.createInvoice({
			customerId: customer.id,
			amount: adjustedAmount,
			dueDate: dueDate,
			paymentStatus: InvoicePaymentStatus.PENDING,
			paymentDate: null,
			status: InvoiceStatus.GENERATED,
			retryAttempts: 0
		});

		// Create payment with adjusted amount
		const payment = await this.paymentsService.createPayment({
			amount: adjustedAmount,
			paymentMethod: PaymentMethod.CARD, 
			invoiceId: invoice.id
		});

		await this.CustomerService.updateSubscription(customerId, {
			subscriptionPlanId: newPlanId,
			subscriptionStartData: new Date()
		});

		await this.notificationsService.sendNotification({
			to: customer.email,
			subject: 'Subscription Payment',
			content: `You have a new subscription payment due on ${dueDate.toLocaleDateString()} for the amount of ${adjustedAmount} please pay to continue your subscription
			Please use the following payment intent id: ${payment.id} to make the payment`
		});

		return {intentId: payment.id};
	}

	private async calculateInvoiceDetails(customer: Customer, newPlan: SubscriptionPlan): Promise<{ adjustedAmount: number, dueDate: Date }> {
		let adjustedAmount = newPlan.price;
		let dueDate = new Date();

		if (customer.subscriptionPlanId && customer.subscriptionStartData) {
			const currentPlan = await this.subscriptionRepository.findOneById(customer.subscriptionPlanId);
			if (currentPlan) {
				// Calculate subscription end date based on current plan's billing cycle
				const billingCycle = currentPlan.billingCycle;
				const subscriptionEndDate = this.calculateSubscriptionEndDate(customer.subscriptionStartData, billingCycle);

				// Calculate remaining days and prorate the amount
				const remainingDays = this.calculateRemainingDays(subscriptionEndDate);
				const prorationFactor = remainingDays / this.getDaysInBillingCycle(currentPlan.billingCycle);
				const proratedAmount = currentPlan.price * prorationFactor;
			
				// Deduct prorated amount from new subscription price
				adjustedAmount = Math.max(0, newPlan.price - proratedAmount);
			}
		}

		// Set due date based on billing cycle
		switch (newPlan.billingCycle.toLowerCase()) {
			case BillingCycle.monthly:
				dueDate.setMonth(dueDate.getMonth() + 1);
				break;
			case BillingCycle.yearly:
				dueDate.setFullYear(dueDate.getFullYear() + 1);
				break;
			case BillingCycle.quarterly:
				dueDate.setMonth(dueDate.getMonth() + 3);
				break;
			default:
				throw new Error(`Unsupported billing cycle: ${newPlan.billingCycle}`);
		}

		return { adjustedAmount, dueDate };
	}

	private calculateRemainingDays(endDate: Date): number {
		const now = new Date();
		const timeDiff = endDate.getTime() - now.getTime();
		return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
	}

	private getDaysInBillingCycle(billingCycle: string): number {
		switch (billingCycle.toLowerCase()) {
			case BillingCycle.monthly:
				return 30;
			case BillingCycle.yearly:
				return 365;
			case BillingCycle.quarterly:
				return 90;
			default:
				throw new Error(`Unsupported billing cycle: ${billingCycle}`);
		}
	}

	private calculateSubscriptionEndDate(startDate: Date, billingCycle: string): Date {
		const endDate = new Date(startDate);
		switch (billingCycle) {
			case 'monthly':
				endDate.setMonth(endDate.getMonth() + 1);
				break;
			case 'yearly':
				endDate.setFullYear(endDate.getFullYear() + 1);
				break;
			case 'quarterly':
				endDate.setMonth(endDate.getMonth() + 3);
				break;
			default:
				throw new Error(`Unsupported billing cycle: ${billingCycle}`);
		}
		return endDate;
	}
}
