import { PrismaClientWrapper } from '../config/dbClient';
import { NotificationService } from '../modules/notifications/notification.service';
import { CustomerService } from '../modules/customers/customers.service';
import { SubscriptionService } from '../modules/subscriptions/subscriptions.service';
import { SubscriptionPlanStatus } from '../modules/subscriptions/types';
import { CustomerRepository } from '../modules/customers/customers.repository';

export async function autoInactiveSubscription(env: Env): Promise<void> {
  const adapter = new PrismaClientWrapper(env);
  const client = adapter.client;
  const notificationService = new NotificationService(env);
  const customerService = new CustomerService(new CustomerRepository(adapter), env);

  console.log('Processing expired subscriptions');

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const expiredSubscriptions = await client.customer.findMany({
    where: {
      subscriptionStatus: 'ACTIVE',
      subscriptionStartDate: {
        not: null,
      },
      subscriptionPlan: {
        isNot: null,
      },
    },
    include: {
      subscriptionPlan: true,
    },
  });

  for (const customer of expiredSubscriptions) {
    if (!customer.subscriptionStartDate || !customer.subscriptionPlanId) continue;

    const expirationDate = new Date(customer.subscriptionStartDate);
    switch (customer?.subscriptionPlan?.billingCycle) {
      case 'monthly':
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        break;
      case 'yearly':
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        break;
      case 'quarterly':
        expirationDate.setMonth(expirationDate.getMonth() + 3);
        break;
    }

    // Check if the subscription expired yesterday
    if (expirationDate.toDateString() === yesterday.toDateString()) {
      console.log(`Inactivating subscription for customer ${customer.id}`);

      // Update customer subscription status to inactive
      await customerService.updateSubscription(customer.id, {
        subscriptionStatus: SubscriptionPlanStatus.inactive,
      });


      // Send notification to the customer
      await notificationService.sendNotification({
        to: customer.email,
        subject: 'Subscription Expired',
        content: `Your subscription has expired. Please renew your subscription to continue using our services.`
      });
    }
  }

  console.log('Finished processing expired subscriptions');
}