import { Context, Next } from 'hono';
import { decode, JwtPayload, verify } from '@tsndr/cloudflare-worker-jwt';

export const jwtAuthMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.req.header('Authorization');
  if (!authHeader) {
    return ctx.json({ message: 'Authorization header missing' }, 401);
  }


  const token = authHeader.split(' ')[1]; // Assuming 'Bearer <token>'
  try {
    const verified =await verify(token, ctx.env.JWT_SECRET);
	if(!verified){
		return ctx.json({ message: 'Authorization header missing' }, 401);
	}
	const data = decode(token) as JwtPayload
	console.log({data})
    ctx.set('userId', data?.payload?.id ); // Set user ID in context for later use
    await next();
  } catch (err) {
    console.log(err)
    return ctx.json({ message: 'Invalid or expired token' }, 401);
  }
};
