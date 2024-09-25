import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Customer } from '@prisma/client';
import { CustomerInput } from './dto/customer-input.dto';
import { CustomerRepository } from './customers.repository';
import { compare, hash } from 'bcryptjs';
import { sign } from '@tsndr/cloudflare-worker-jwt';
import { SubscriptionPlanStatus } from '../subscriptions/types';

@injectable()
export class CustomerService {
  constructor(@inject(TYPES.CustomerRepository) private customerRepository: CustomerRepository,@inject('Env') private env: Env) {}

  async list(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
	async findOne(id:string): Promise<Customer|null> {
    return this.customerRepository.findOne(id);
  }
  async create(data: Pick<Customer,"email"|"name"|"password">): Promise<Customer> {
    return this.customerRepository.create(data);
  }

  async update(id: string, data: Partial<Omit<CustomerInput, 'id'>>): Promise<Customer | null> {
    return this.customerRepository.update(id, data);
  }

	async login(email: string, password: string): Promise<string | null> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      return null;
    }

    const isPasswordValid = await compare(password, customer.password);
    if (!isPasswordValid) {
      return null;
    }
		console.log({ id: customer.id, email: customer.email }, this.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    const token = sign({ id: customer.id, email: customer.email }, this.env.JWT_SECRET);

    return token;
  }

	async signup(email: string, password: string, name: string): Promise<Customer | null> {
    const existingCustomer = await this.customerRepository.findByEmail(email);
    if (existingCustomer) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hash(password, 10);

    return this.customerRepository.create({
      email,
      password: hashedPassword,
      name
    });
  }

  async updateSubscription(customerId: string, input:Partial<Customer> ): Promise<Customer | null> {
    return this.customerRepository.update(customerId, input);
  }
}
