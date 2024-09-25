import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Customer } from '@prisma/client';
import { hash } from 'bcryptjs';
import { CustomerRepository } from '../../src/modules/customers/customers.repository';
import { CustomerService } from '../../src/modules/customers/customers.service';

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockCustomerRepository: CustomerRepository;
  let mockEnv: { JWT_SECRET: string };

  beforeEach(() => {
    mockCustomerRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
    } as unknown as CustomerRepository;

    mockEnv = { JWT_SECRET: 'test-secret' };

    customerService = new CustomerService(mockCustomerRepository, mockEnv);
  });

  describe('signup', () => {
    it('should create a new customer', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      const hashedPassword = await hash(password, 10);
      const mockCustomer: Customer = {
        id: '1',
        email,
        password: hashedPassword,
        name,
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(mockCustomerRepository.create).mockResolvedValue(mockCustomer);

      const result = await customerService.signup(email, password, name);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockCustomerRepository.create).toHaveBeenCalledWith({
        email,
        password: expect.any(String), // Hashed password
        name,
      });
    });

    it('should throw an error if email is already in use', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const name = 'Existing User';

      vi.mocked(mockCustomerRepository.findByEmail).mockResolvedValue({} as Customer);

      await expect(customerService.signup(email, password, name)).rejects.toThrow('Email already in use');
    });
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await hash(password, 10);

      const mockCustomer: Customer = {
        id: '1',
        email,
        password: hashedPassword,
        name: 'Test User',
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerRepository.findByEmail).mockResolvedValue(mockCustomer);

      const result = await customerService.login(email, password);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should return null for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      vi.mocked(mockCustomerRepository.findByEmail).mockResolvedValue(null);

      const result = await customerService.login(email, password);

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      const customerId = '1';
      const mockCustomer: Customer = {
        id: customerId,
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerRepository.findOne).mockResolvedValue(mockCustomer);

      const result = await customerService.findOne(customerId);

      expect(result).toEqual(mockCustomer);
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith(customerId);
    });

    it('should return null if customer is not found', async () => {
      const customerId = 'nonexistent';

      vi.mocked(mockCustomerRepository.findOne).mockResolvedValue(null);

      const result = await customerService.findOne(customerId);

      expect(result).toBeNull();
      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith(customerId);
    });
  });

  describe('update', () => {
    it('should update customer information', async () => {
      const customerId = '1';
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedCustomer: Customer = {
        id: customerId,
        ...updateData,
        password: 'hashedpassword',
        subscriptionPlanId: null,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCustomerRepository.update).mockResolvedValue(updatedCustomer);

      const result = await customerService.update(customerId, updateData);

      expect(result).toEqual(updatedCustomer);
      expect(mockCustomerRepository.update).toHaveBeenCalledWith(customerId, updateData);
    });

    it('should return null if customer is not found', async () => {
      const customerId = 'nonexistent';
      const updateData = { name: 'Updated Name' };

      vi.mocked(mockCustomerRepository.update).mockResolvedValue(null);

      const result = await customerService.update(customerId, updateData);

      expect(result).toBeNull();
      expect(mockCustomerRepository.update).toHaveBeenCalledWith(customerId, updateData);
    });
  });
});