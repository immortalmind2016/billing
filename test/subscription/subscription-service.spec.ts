import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionService } from '../../src/modules/subscriptions/subscriptions.service';
import { SubscriptionRepository } from '../../src/modules/subscriptions/subscriptions.repository';
import { CustomerService } from '../../src/modules/customers/customers.service';
import { InvoicesService } from '../../src/modules/invoices/invoices.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { NotificationService } from '../../src/modules/notifications/notification.service';
import { SubscriptionPlan, Customer } from '@prisma/client';
import { BillingCycle, SubscriptionPlanStatus } from '../../src/modules/subscriptions/types';
import { EntityNotFoundError } from '../../src/shared/internal/database.exceptions';


describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let mockSubscriptionRepository: SubscriptionRepository;
  let mockCustomerService: CustomerService;
  let mockInvoicesService: InvoicesService;
  let mockPaymentsService: PaymentsService;
  let mockNotificationService: NotificationService;

  beforeEach(() => {
    mockSubscriptionRepository = {
      findAll: vi.fn(),
      findOneById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as SubscriptionRepository;

    mockCustomerService = {
      findOne: vi.fn(),
      updateSubscription: vi.fn(),
    } as unknown as CustomerService;

    mockInvoicesService = {
      createInvoice: vi.fn(),
    } as unknown as InvoicesService;

    mockPaymentsService = {
      createPayment: vi.fn(),
    } as unknown as PaymentsService;

    mockNotificationService = {
      sendNotification: vi.fn(),
    } as unknown as NotificationService;

    subscriptionService = new SubscriptionService(
      mockSubscriptionRepository,
      mockCustomerService,
      mockInvoicesService,
      mockPaymentsService,
      mockNotificationService
    );
  });

  describe('list', () => {
    it('should return all subscription plans', async () => {
      const mockPlans: SubscriptionPlan[] = [
        { id: '1', name: 'Basic', billingCycle: BillingCycle.monthly, price: 9.99, status: SubscriptionPlanStatus.active, createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Premium', billingCycle: BillingCycle.yearly, price: 99.99, status: SubscriptionPlanStatus.active, createdAt: new Date(), updatedAt: new Date() },
      ];

      vi.mocked(mockSubscriptionRepository.findAll).mockResolvedValue(mockPlans);

      const result = await subscriptionService.list();

      expect(result).toEqual(mockPlans);
      expect(mockSubscriptionRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new subscription plan', async () => {
      const newPlan = {
        name: 'New Plan',
        billingCycle: BillingCycle.monthly,
        price: 19.99,
        status: SubscriptionPlanStatus.active,
      };

      const createdPlan: SubscriptionPlan = {
        ...newPlan,
        id: '3',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockSubscriptionRepository.create).mockResolvedValue(createdPlan);

      const result = await subscriptionService.create(newPlan);

      expect(result).toEqual(createdPlan);
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(newPlan);
    });
  });

  describe('update', () => {
    it('should update an existing subscription plan', async () => {
      const planId = '1';
      const updateData = {
        name: 'Updated Plan',
        price: 29.99,
      };

      const updatedPlan: SubscriptionPlan = {
        id: planId,
        name: 'Updated Plan',
        billingCycle: BillingCycle.monthly,
        price: 29.99,
        status: SubscriptionPlanStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockSubscriptionRepository.update).mockResolvedValue(updatedPlan);

      const result = await subscriptionService.update(planId, updateData);

      expect(result).toEqual(updatedPlan);
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(planId, updateData);
    });

    it('should throw an error if the plan is not found', async () => {
      const planId = 'nonexistent';
      const updateData = { name: 'Updated Plan' };

      vi.mocked(mockSubscriptionRepository.update).mockRejectedValue(new EntityNotFoundError('SubscriptionPlan', planId));

      await expect(subscriptionService.update(planId, updateData)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a subscription plan', async () => {
      const planId = '1';

      vi.mocked(mockSubscriptionRepository.delete).mockResolvedValue('OK');

      const result = await subscriptionService.delete(planId);

      expect(result).toBe('OK');
      expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(planId);
    });

    it('should throw an error if the plan is not found', async () => {
      const planId = 'nonexistent';

      vi.mocked(mockSubscriptionRepository.delete).mockRejectedValue(new EntityNotFoundError('SubscriptionPlan', planId));

      await expect(subscriptionService.delete(planId)).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('subscribe', () => {
    it('should subscribe a customer to a plan', async () => {
      const customerId = '1';
      const planId = '2';

      const mockCustomer: Customer = {
        id: customerId,
        name: 'Test Customer',
        email: 'test@example.com',
        password: 'hashedpassword',
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPlan: SubscriptionPlan = {
        id: planId,
        name: 'Premium',
        billingCycle: BillingCycle.monthly,
        price: 29.99,
        status: SubscriptionPlanStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerService.findOne).mockResolvedValue(mockCustomer);
      vi.mocked(mockSubscriptionRepository.findOneById).mockResolvedValue(mockPlan);
      vi.mocked(mockInvoicesService.createInvoice).mockResolvedValue({ id: 'inv1' } as any);
      vi.mocked(mockPaymentsService.createPayment).mockResolvedValue({ id: 'pay1' } as any);
      vi.mocked(mockCustomerService.updateSubscription).mockResolvedValue({ ...mockCustomer, subscriptionPlanId: planId } as any);

      const result = await subscriptionService.subscribe(customerId, planId);

      expect(result).toEqual({ intentId: 'pay1' });
      expect(mockCustomerService.findOne).toHaveBeenCalledWith(customerId);
      expect(mockSubscriptionRepository.findOneById).toHaveBeenCalledWith(planId);
      expect(mockInvoicesService.createInvoice).toHaveBeenCalled();
      expect(mockPaymentsService.createPayment).toHaveBeenCalled();
      expect(mockCustomerService.updateSubscription).toHaveBeenCalled();
      expect(mockNotificationService.sendNotification).toHaveBeenCalled();
    });

    it('should throw an error if the customer is not found', async () => {
      const customerId = 'nonexistent';
      const planId = '2';

      vi.mocked(mockCustomerService.findOne).mockResolvedValue(null);

      await expect(subscriptionService.subscribe(customerId, planId)).rejects.toThrow(EntityNotFoundError);
    });

    it('should throw an error if the plan is not found', async () => {
      const customerId = '1';
      const planId = 'nonexistent';

      const mockCustomer: Customer = {
        id: customerId,
        name: 'Test Customer',
        email: 'test@example.com',
        password: 'hashedpassword',
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerService.findOne).mockResolvedValue(mockCustomer);
      vi.mocked(mockSubscriptionRepository.findOneById).mockResolvedValue(null);

      await expect(subscriptionService.subscribe(customerId, planId)).rejects.toThrow(EntityNotFoundError);
    });
  });
});