import { inject, injectable } from 'inversify';
import { PrismaClientWrapper } from '../../config/dbClient';
import { Customer } from '@prisma/client';

@injectable()
export class CustomerRepository {
  private prisma: PrismaClientWrapper;

  constructor(@inject(PrismaClientWrapper) prisma: PrismaClientWrapper) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Customer[]> {
    return this.prisma.client.customer.findMany();
  }

  async create(data: Pick<Customer,"email"|"name">): Promise<Customer> {
    return this.prisma.client.customer.create({
      data,
    });
  }

  async update(id: string, data: Partial<Omit<Customer, 'id'>>): Promise<Customer | null> {
    return this.prisma.client.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Customer | null> {
    return this.prisma.client.customer.delete({
      where: { id },
    });
  }
}
