import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SubscriptionService } from "./subscriptions.service";
import { SubscriptionPlan } from "./dto/subscription-response.dto";
import { Get, Route } from "@tsoa/runtime";

@injectable()
@Route("/api/subscription")
export class SubscriptionController {
  constructor(
    @inject(TYPES.SubscriptionService) private subscriptionService: SubscriptionService
  ) {}

  // List all subscription plans
	@Get("/")
  async list() {
    return this.subscriptionService.list();
  }

  // Create a new subscription plan
  async create(data: SubscriptionPlan) {
    return this.subscriptionService.create(data);
  }

  // Update an existing subscription plan
  async update(id: string, data: Partial<SubscriptionPlan>) {
    return this.subscriptionService.update(id, data);
  }

  // Delete a subscription plan
  async delete(id: string) {
    return this.subscriptionService.delete(id);
  }
}
