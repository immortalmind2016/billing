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
