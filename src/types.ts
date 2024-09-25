import { D1Database } from '@cloudflare/workers-types';


export const TYPES = {
	SubscriptionService: Symbol.for('SubscriptionService'),
	SubscriptionRepository: Symbol.for('SubscriptionRepository'),
	SubscriptionController: Symbol.for('SubscriptionController'),
	CustomerService: Symbol.for('CustomerService'),
	CustomerRepository: Symbol.for('CustomerRepository'),
	CustomerController: Symbol.for('CustomerController'),
	PaymentsService: Symbol.for('PaymentsService'),
	PaymentsRepository: Symbol.for('PaymentsRepository'),
	PaymentsController: Symbol.for('PaymentsController'),
	InvoicesService: Symbol.for('InvoicesService'),
	InvoicesRepository: Symbol.for('InvoicesRepository'),
	InvoicesController: Symbol.for('InvoicesController'),
	NotificationService: Symbol.for('NotificationService'),
};
