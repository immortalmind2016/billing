import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { Customer } from '@prisma/client';
import { CustomerInput } from './dto/customer-input.dto';
import { CustomerRepository } from './customers.repository';

@injectable()
export class CustomerService {
  constructor(@inject(TYPES.CustomerRepository) private customerRepository: CustomerRepository) {}

  async list(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async create(data: Pick<Customer,"email"|"name">): Promise<Customer> {
    return this.customerRepository.create(data);
  }

  async update(id: string, data: Partial<Omit<CustomerInput, 'id'>>): Promise<Customer | null> {
    return this.customerRepository.update(id, data);
  }

  async delete(id: string): Promise<Customer | null> {
    return this.customerRepository.delete(id);
  }
}
