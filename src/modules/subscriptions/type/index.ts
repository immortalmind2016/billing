export interface SubscriptionPlan{
	id: string;
	name: string;
	billingCycle: string; // Could be 'monthly', 'yearly', etc.
	price: number;
	status: string; // Could be 'active', 'inactive', etc.
}
