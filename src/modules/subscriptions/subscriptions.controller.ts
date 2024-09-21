// src/api/customers.ts
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { SubscriptionService } from "./subscriptions.service";


@injectable()
export class SubscriptionController {
  constructor(
    @inject(TYPES.SubscriptionService) private subscriptionService: SubscriptionService
  ) {}

  async list() {
    return await this.subscriptionService.list();
  }
}
