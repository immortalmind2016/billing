import "reflect-metadata"
import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { CustomerService } from "./customers.service";
import { Get, Route ,Body, Post, Path, Put, Security, Inject} from "@tsoa/runtime";
import { CustomerInput, CustomerLoginDto } from "./dto/customer-input.dto";
import { Customer } from "@prisma/client";
import {ErrorHandler} from "hono"
import { HTTPException } from "hono/http-exception";

@injectable()
@Route("/api/customers")
export class CustomerController {
  constructor(
    @inject(TYPES.CustomerService) private customerService: CustomerService
  ) {}



	 // get my info
	 @Get("/me")
	 @Security('jwt')
	 async find(@Inject() id:string) {
		 return this.customerService.findOne(id);
	 }


  // Update an existing customer
	@Put("/{id}")
  @Security('jwt')
  async update(@Path() id: string,@Body() data: Partial<Omit<Customer,"id">>) {
    return this.customerService.update(id, data);
  }


	@Post('/signup')
  async signup(@Body() data: CustomerInput): Promise<{ message: string }> {
    const customer = await this.customerService.signup(data.email, data.password, data.name);
    if (!customer) {
      throw new Error('Signup failed');
    }
    return { message: 'Signup successful' };
  }

  @Post('/login')
  async login(@Body() data: CustomerLoginDto): Promise<{ token: string } | null> {
    const token = await this.customerService.login(data.email, data.password);
    if (!token) {
      throw new HTTPException(401,{message:"Invalid credentials"})
    }
    return { token };
  }
}
