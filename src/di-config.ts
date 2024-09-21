import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
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



export { container };
