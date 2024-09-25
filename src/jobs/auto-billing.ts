import { PrismaClientWrapper } from '../config/dbClient';
import { NotificationService } from '../modules/notifications/notification.service';
import { InvoicesService } from '../modules/invoices/invoices.service';
import { PaymentsService } from '../modules/payments/payments.service';
import { BillingCycle } from '../modules/subscriptions/types';
import { InvoiceStatus, InvoicePaymentStatus } from '../modules/invoices/types';
import { InvoicesRepository } from '../modules/invoices/invoices.repository'; // Assuming this is the correct import
import { CustomerService } from '../modules/customers/customers.service';
import { PaymentsRepository } from '../modules/payments/payments.repository';
import { CustomerRepository } from '../modules/customers/customers.repository';


export async function autoBilling(env: Env): Promise<void> {
  const adapter = new PrismaClientWrapper(env);
  const client = adapter.client;
  const notificationService = new NotificationService(env);
  const invoicesRepository = new InvoicesRepository(adapter);
  const invoicesService = new InvoicesService(invoicesRepository);
  const paymentsRepository = new PaymentsRepository(adapter);
  const customersRepository = new CustomerRepository(adapter);
  const customerService = new CustomerService(customersRepository, env);
  const paymentsService = new PaymentsService(paymentsRepository, invoicesService, notificationService, customerService,);

  console.log('Processing expiring subscriptions and creating new invoices');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiringSubscriptions = await client.customer.findMany({
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

  for (const customer of expiringSubscriptions) {
    if (!customer.subscriptionStartDate || !customer.subscriptionPlan) continue;

    const expirationDate = new Date(customer.subscriptionStartDate);
    switch (customer.subscriptionPlan.billingCycle) {
      case BillingCycle.monthly:
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        break;
      case BillingCycle.yearly:
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        break;
      case BillingCycle.quarterly:
        expirationDate.setMonth(expirationDate.getMonth() + 3);
        break;
    }

    // Check if the subscription is expiring today
    if (expirationDate.toDateString() === today.toDateString()) {
      console.log(`Creating new invoice for customer ${customer.id}`);

      // Create a new invoice
      const newInvoice = await invoicesService.createInvoice({
        customerId: customer.id,
        amount: customer.subscriptionPlan.price,
        dueDate: new Date(), // Due in 1 day
        paymentStatus: InvoicePaymentStatus.PENDING,
        status: InvoiceStatus.GENERATED,
        paymentDate: null,
        retryAttempts: 0
      });

      // Create a new payment intent
      const paymentIntent = await paymentsService.createPayment({
        invoiceId: newInvoice.id,
        amount: newInvoice.amount,
        paymentMethod: 'CARD', 
      });

    
      await notificationService.sendNotification({
        to: customer.email,
        subject: 'Your Subscription is Renewing',
        content: `Your subscription is due for renewal. Please complete the payment using the following link: ${paymentIntent.id}`
      });

    }
  }

  console.log('Finished processing expiring subscriptions');
}
