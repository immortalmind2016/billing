# Subscription Management System


## How to run the project

NOTE: make sure to have a .dev.env file with the correct variables.
1. Install the dependencies: `pnpm install`
2. `npx wrangler d1 migrations apply billing-app-prod --local`
3. `npm run dev`

## How to start the cron jobs locally
1. `npx wrangler dev --test-scheduled`

## How to run the tests
1. `npm run test`

## Swagger
#### to build the swagger file:
`npx tsoa spec`
use the following link to access the swagger ui:
[http://localhost:8787/api-docs](http://localhost:8787/api-docs)

## CI / github actions
- linting
- testing

## Depency injection
### Why?
- It helps to decouple the classes from each other.
- It helps to make the code more testable.
- It helps to make the code more maintainable.

### We are using the `inversify` library to handle the dependency injection.
- Use the `@injectable()` decorator to make the class injectable.
- Use the `@inject()` decorator to inject the dependencies.
- Use the `container.bind().to(Class).inSingletonScope()` to bind the class to the container.
- Use the `container.get(Class)` to get the instance of the class.
example: 
```
container.bind(TYPES.SubscriptionService).to(SubscriptionService);
const subscriptionService = container.get(TYPES.SubscriptionService);
```

## Flow overview summary

### Success flow
1. Customer signs up
2. Customer selects a subscription plan
3. Invoice is generated 
4. Payment intent is created
5. Recieve payment intent in you email
6. Pay the payment intent (using /webhook)
7. You will receive a success email

### Failed flow
1. Customer signs up
2. Customer selects a subscription plan
3. Invoice is generated 
4. Payment intent is created
5. Recieve payment intent in you email
6. Pay the payment intent (using /webhook) [failed]
7. You will receive a failure email
8. After minutes you will receive a retry email
9. Pay the payment intent (using /webhook) [success]
10. You will receive a success email




## Flow Overview in detail

### 1. Customer Signup

- **Entities:** `Customer`
- **Action:** A new customer signs up for the service.
- **Status:**
  - `Customer.id`: Unique identifier generated.
  - `Customer.name`: Set to provided name.
  - `Customer.email`: Set to provided email.
  - `Customer.password`: Hashed and stored.
  - `Customer.subscriptionPlanId`: Null (not subscribed yet).
  - `Customer.subscriptionStatus`: Null.
  - `Customer.subscriptionStartDate`: Null.

### 2. Subscription Selection

- **Entities:** `Customer`, `SubscriptionPlan`
- **Action:** Customer selects a subscription plan.
- **Status:**
  - `Customer.subscriptionPlanId`: Updated with selected plan ID.
  - `Customer.subscriptionStatus`: Set to "ACTIVE".
  - `Customer.subscriptionStartDate`: Set to current date.

### 3. Invoice Generation

- **Entities:** `Invoice`, `Customer`, `SubscriptionPlan`
- **Action:** System generates an invoice for the subscription.
- **Status:**
  - `Invoice.id`: Unique identifier generated.
  - `Invoice.customerId`: Set to customer's ID.
  - `Invoice.amount`: Calculated based on subscription plan (see calculation details below).
  - `Invoice.dueDate`: Set based on billing cycle (e.g., 30 days from now for monthly).
  - `Invoice.paymentStatus`: Set to "PENDING".
  - `Invoice.status`: Set to "GENERATED".

### 4. Payment Intent Creation

- **Entities:** `Payment`, `Invoice`
- **Action:** System creates a payment intent for the invoice.
- **Status:**
  - `Payment.id`: Unique identifier generated.
  - `Payment.invoiceId`: Linked to the generated invoice.
  - `Payment.amount`: Set to invoice amount.
  - `Payment.paymentMethod`: Not set yet.
  - `Payment.paymentDate`: Not set yet.

### 5. Payment Processing

- **Entities:** `Payment`, `Invoice`
- **Action:** Customer makes a payment for the invoice.
- **Status:**
  - `Payment.paymentMethod`: Updated with payment method used.
  - `Payment.paymentDate`: Set to current date.
  - `Invoice.paymentStatus`: Updated to "PAID".
  - `Invoice.status`: Updated to "ISSUED".
  - `Invoice.paymentDate`: Set to current date.

### 6. Cron Jobs

The system includes three cron jobs to handle various automated tasks:

#### a. Retry Failed Payments (`retry-failed-payment.ts`)
- **Purpose:** Processes failed payment invoices and attempts to retry the payment.
- **Actions:**
  - Finds invoices with failed payment status.
  - Increments retry attempts for each invoice.
  - Sends a notification email to the customer for retry.
  - Stops retrying after reaching the maximum retry attempts.

#### b. Auto-Billing (`auto-billing.ts`)
- **Purpose:** Processes expiring subscriptions and creates new invoices.
- **Actions:**
  - Identifies subscriptions expiring on the current day.
  - Creates new invoices for these subscriptions.
  - Generates payment intents for the new invoices.
  - Sends renewal notifications to customers.

#### c. Auto-Inactive Subscription (`auto-inactive-subscription.ts`)
- **Purpose:** Marks subscriptions as inactive one day after their end date.
- **Actions:**
  - Identifies subscriptions that expired the previous day.
  - Updates the subscription status to 'INACTIVE' for these customers.
  - Sends expiration notifications to affected customers.

These cron jobs ensure that the subscription system operates smoothly, handling payment retries, automatic renewals, and subscription status updates without manual intervention.

## Invoice Amount Calculation

The invoice amount is calculated based on the subscription plan and any prorated charges. Here's how it works:

1. **Full Billing Cycle:**
   - Amount = Subscription Plan Price

2. **Prorated Billing (for partial periods):**
   - Daily Rate = Subscription Plan Price / Days in Billing Cycle
   - Prorated Days = Days from Start to End of Partial Period
   - Prorated Amount = Daily Rate * Prorated Days

3. **Mathematical Description:**
   ```
   Invoice Amount = (Subscription Plan Price / Days in Billing Cycle) * Days in Current Period
   ```

   Where:
   - Days in Billing Cycle: 30 for monthly, 90 for quarterly, 365 for yearly
   - Days in Current Period: Number of days from the start of the subscription (or last billing date) to the end of the current period (or cancellation date)

This calculation ensures that customers are billed accurately for the exact duration of their subscription, even if they start or end their subscription mid-cycle.




## Payment Webhook

The system includes a payment webhook endpoint to handle payment confirmations from the payment processor (e.g., Stripe). This webhook ensures that the system is updated with the latest payment information.

### Webhook Endpoint

- **URL:** `/payments/webhook`
- **Method:** POST

### Webhook Payload

The webhook expects a JSON payload with the following structure: 

```
{

    "paymentId":"cm1i3qmad0003148y3njymnsi",
    "amount":29.99,
    "status":"PAID",
    "paymentDate": "2024-09-23T00:00:00Z",
    "customerId":"cm1i3nfgr00019qnm1rggrz5v"

}
```






# Future Improvements
- Add more logging (e.g. use pinoJs)
- Add monitoring (e.g. datadog)
- Add more error handling
- Add admin middleware to protect the endpoints.
- Add more tests.
- Add integration tests.
- Refactor the part of swagger endpoint in different file separatly.
- Handle already subscribed customers.
- Add migration files as per the db changes.

