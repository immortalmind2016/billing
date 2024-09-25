import { InvoicePaymentStatus, InvoiceStatus } from '../modules/invoices/types';
import { PrismaClientWrapper } from '../config/dbClient';
import { NotificationService } from '../modules/notifications/notification.service';

const MAX_RETRY_ATTEMPTS = 3; // Threshold for retry attempts

export async function retryFailedPayment(env: Env): Promise<void> {
  const notificationService = new NotificationService(env);
  const adapter = new PrismaClientWrapper(env);
  const client = adapter.client;
  console.log('Processing failed payment invoices');

  const failedPaymentInvoices = await client.invoice.findMany({
    where: {
      paymentStatus: InvoicePaymentStatus.FAILED,
      retryAttempts: { lt: MAX_RETRY_ATTEMPTS }
    },
    include: {
      customer: true
    }
  });

  for (const invoice of failedPaymentInvoices) {
    if (invoice.customer) {
      // Increment retry attempts
      const updatedInvoice = await client.invoice.update({
        where: { id: invoice.id },
        data: { 
          retryAttempts: { increment: 1 }
        }
      });
      const payment = await client.payment.findUnique({
        where: {
          invoiceId: invoice.id
        }
      });

      // Send retry email
      await notificationService.sendNotification(
        {
          to: invoice.customer.email,
          subject: 'Payment Retry',
          content: `Your payment for invoice ${invoice.id} has failed. Please try again, 
          using the following link ${payment?.id}`
        }
      );

      console.log(`Retry email sent for invoice ${invoice.id}. Attempt ${updatedInvoice.retryAttempts}`);
    }
  }
}