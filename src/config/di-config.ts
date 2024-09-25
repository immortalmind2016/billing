import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '../types';
import { PrismaClientWrapper } from './dbClient';
import { SubscriptionService } from '../modules/subscriptions/subscriptions.service';
import { SubscriptionRepository } from '../modules/subscriptions/subscriptions.repository';
import { SubscriptionController } from '../modules/subscriptions/subscriptions.controller';
import { CustomerService } from '../modules/customers/customers.service';
import { CustomerRepository } from '../modules/customers/customers.repository';
import { CustomerController } from '../modules/customers/customers.controller';
import { PaymentsService } from '../modules/payments/payments.service';
import { PaymentsRepository } from '../modules/payments/payments.repository';
import { PaymentsController } from '../modules/payments/payments.controller';
import { InvoicesService } from '../modules/invoices/invoices.service';
import { InvoicesRepository } from '../modules/invoices/invoices.repository';
import { InvoicesController } from '../modules/invoices/invoices.controller';
import { NotificationService } from '../modules/notifications/notification.service';

// Create the container
const container = new Container();


// Bind PrismaClientWrapper
container.bind<PrismaClientWrapper>(PrismaClientWrapper).toSelf().inSingletonScope();

container.bind<SubscriptionService>(TYPES.SubscriptionService).to(SubscriptionService);
container.bind(TYPES.SubscriptionRepository).to(SubscriptionRepository);
container.bind(TYPES.SubscriptionController).to(SubscriptionController);

container.bind<CustomerService>(TYPES.CustomerService).to(CustomerService);
container.bind(TYPES.CustomerRepository).to(CustomerRepository);
container.bind(TYPES.CustomerController).to(CustomerController);


container.bind<PaymentsService>(TYPES.PaymentsService).to(PaymentsService);
container.bind(TYPES.PaymentsRepository).to(PaymentsRepository);
container.bind(TYPES.PaymentsController).to(PaymentsController);

container.bind<InvoicesService>(TYPES.InvoicesService).to(InvoicesService);
container.bind(TYPES.InvoicesRepository).to(InvoicesRepository);
container.bind(TYPES.InvoicesController).to(InvoicesController);

container.bind<NotificationService>(TYPES.NotificationService).to(NotificationService);



export { container };
