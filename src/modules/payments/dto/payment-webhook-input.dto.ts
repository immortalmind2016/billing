import {IsDateString, IsEnum, IsNumber, IsString } from "class-validator";

export enum PaymentWebhookStatus {
    PAID = 'PAID',
    FAILED = 'FAILED',
}


export class PaymentWebhookInput {

    @IsDateString()
	paymentDate: Date;
    
    @IsNumber()
	amount: number;

    @IsEnum(PaymentWebhookStatus)
	status:PaymentWebhookStatus
    @IsString()
	paymentId:string

    @IsString()
    customerId:string

    constructor(invoiceId: string, paymentDate: Date, amount: number, status: PaymentWebhookStatus,paymentId:string,customerId:string) {
        this.paymentDate = paymentDate;
        this.amount = amount;
        this.status = status;
		this.paymentId=paymentId
        this.customerId=customerId
    }
}
