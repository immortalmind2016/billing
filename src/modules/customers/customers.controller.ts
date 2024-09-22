import "reflect-metadata"
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CustomerService } from "./customers.service";
import { Get, Route ,Body, Post, Path, Put, Delete} from "@tsoa/runtime";
import { CustomerInput } from "./dto/customer-input.dto";
import { Customer } from "@prisma/client";

@injectable()
@Route("/api/customers")
export class CustomerController {
  constructor(
    @inject(TYPES.SubscriptionService) private customerService: CustomerService
  ) {}

  // List all subscription plans
	@Get("/plans")
  async list() {
    return this.customerService.list();
  }


  // Create a new subscription plan
	@Post("/plans")
  async create(@Body() data: CustomerInput) {
    return this.customerService.create(data);
  }

  // Update an existing subscription plan
	@Put("/plans/{id}")
  async update(@Path() id: string,@Body() data: Partial<Omit<Customer,"id">>) {
    return this.customerService.update(id, data);
  }

  // Delete a subscription plan
	@Delete("plans/{id}")
  async delete(@Path() id: string) {
    return this.customerService.delete(id);
  }
}
