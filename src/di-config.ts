import 'reflect-metadata';
import { Container } from 'inversify';
import { CustomerService } from './modules/customer/customer.service';
import { CustomerController } from './modules/customer/customer.controller';
import { TYPES } from './types';
import { CustomerRepository } from './modules/customer/customer.repository';
import { PrismaClientWrapper } from './config/dbClient';
import { SubscriptionService } from './modules/subscriptions/subscriptions.service';
import { SubscriptionRepository } from './modules/subscriptions/subscriptions.repository';
import { SubscriptionController } from './modules/subscriptions/subscriptions.controller';

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



export { container };
