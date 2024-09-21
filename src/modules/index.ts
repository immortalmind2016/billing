// import { Hono } from 'hono';
// import { container } from '../di-config';
// import { CustomerController } from './customer/customer.controller';


// const app = new Hono();

// // Get controllers from the inversify container
// const customerController = container.get<CustomerController>(CustomerController);

// // Define routes
// app.get('/customers', async (c) => customerController.getCustomers());


// // Handle fetch event
// addEventListener('fetch', (event: FetchEvent) => {
//   event.respondWith(app.fetch(event.request));
// });
