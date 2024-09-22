import { IsString } from "class-validator";

export class QueryParamDto{
	@IsString()
	id:string;

	constructor(id:string){
		this.id=id
	}
}
