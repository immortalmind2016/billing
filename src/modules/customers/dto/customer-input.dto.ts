import "reflect-metadata";
import { IsString } from "class-validator";
import { Customer } from "@prisma/client";


export class CustomerInput {
	@IsString()
  name: string;

	@IsString()
	email:string;

  constructor(name: string, email:string) {
    this.name = name;
    this.email = email;
  }
}

export class CustomerUpdateDto extends CustomerInput {
	@IsString()
  subscriptionPlanId: string;

	@IsString()
	subscriptionStatus:string;

  constructor(subscriptionPlanId: string, subscriptionStatus:string,name:string,email:string) {
		super(name,email)
    this.subscriptionPlanId = subscriptionPlanId;
    this.subscriptionStatus = subscriptionStatus;
  }

}
