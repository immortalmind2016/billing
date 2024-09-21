import "reflect-metadata";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { BillingCycle } from "../types";


export class SubscriptionPlanInput {
	@IsString()
  name: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsNumber()
  price: number;

  @IsString()
  status: string;

  constructor(name: string, billingCycle: BillingCycle, price: number, status: string) {
    this.name = name;
    this.billingCycle = billingCycle;
    this.price = price;
    this.status = status;
  }
}
