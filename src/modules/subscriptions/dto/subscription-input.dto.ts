import "reflect-metadata";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BillingCycle } from "../types";

export class SubscriptionUpdateDto{
	@IsString()
	@IsOptional()
  name?: string;

  @IsEnum(BillingCycle)
	@IsOptional()
  billingCycle?: BillingCycle;

  @IsNumber()
	@IsOptional()
  price?: number;

  @IsString()
	@IsOptional()
  status?: string;


}
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
