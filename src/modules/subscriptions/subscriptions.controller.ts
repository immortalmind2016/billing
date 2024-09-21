import "reflect-metadata"
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SubscriptionService } from "./subscriptions.service";
import { SubscriptionPlan } from "./dto/subscription-response.dto";
import { Get, Route ,Body, Post, Path, Put, Delete} from "@tsoa/runtime";

@injectable()
@Route("/api/subscriptions")
export class SubscriptionController {
  constructor(
    @inject(TYPES.SubscriptionService) private subscriptionService: SubscriptionService
  ) {}

  // List all subscription plans
	@Get("/plans")
  async list() {
    return this.subscriptionService.list();
  }


  // Create a new subscription plan
	@Post("/plans")
  async create(@Body() data: SubscriptionPlan) {
    return this.subscriptionService.create(data);
  }

  // Update an existing subscription plan
	@Put("/plans/{id}")
  async update(@Path() id: string,@Body() data: Partial<SubscriptionPlan>) {
    return this.subscriptionService.update(id, data);
  }

  // Delete a subscription plan
	@Delete("plans/{id}")
  async delete(@Path() id: string) {
    return this.subscriptionService.delete(id);
  }
}
