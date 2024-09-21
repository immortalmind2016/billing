import { CustomerRepository } from "./modules/customer/customer.repository";

export const TYPES = {
	CustomerService: Symbol.for('CustomerService'),
	CustomerRepository: Symbol.for('CustomerRepository'),
	CustomerController: Symbol.for('CustomerController'),

	SubscriptionService: Symbol.for('SubscriptionService'),
	SubscriptionRepository: Symbol.for('SubscriptionRepository'),
	SubscriptionController: Symbol.for('SubscriptionController'),
	// CustomerModel: Symbol.for('CustomerModel'),
  };
