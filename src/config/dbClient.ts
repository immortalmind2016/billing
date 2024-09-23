// prisma-client.ts
import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';



@injectable()
export class PrismaClientWrapper {
	public client: PrismaClient;

	constructor(@inject('Env') env: Env) {
		console.log({ env });
		const adapter = new PrismaD1(env.DB);
		this.client = new PrismaClient({ adapter });
	}
}
