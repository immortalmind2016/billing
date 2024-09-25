import "reflect-metadata";
import { IsOptional, IsString } from "class-validator";
import { Customer } from "@prisma/client";


export class CustomerInput {
	@IsString()
  	name: string;

	@IsString()
	email:string;

	@IsString()
	password:string;

  constructor(name: string, email:string, password:string ) {
    this.name = name;
    this.email = email;
	this.password = password
  }
}

export class CustomerLoginDto{

	@IsString()
	email:string;

	@IsString()
	password:string;

  constructor( email:string, password:string ) {
    this.email = email;
		this.password = password
  }
}

export class CustomerUpdateDto {

	@IsString()
	@IsOptional()
  name?: string;

	@IsString()
	@IsOptional()
	email?:string;

	@IsString()
	@IsOptional()
  subscriptionPlanId?: string;

	@IsString()
	@IsOptional()
	subscriptionStatus?:string;

  constructor(subscriptionPlanId: string, subscriptionStatus:string,name:string,email:string) {

    this.subscriptionPlanId = subscriptionPlanId;
    this.subscriptionStatus = subscriptionStatus;
		this.name = name;
    this.email = email;
  }
}





