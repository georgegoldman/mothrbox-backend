/* eslint-disable @typescript-eslint/no-unused-vars */
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import helmet from '@fastify/helmet';
import fastifyCookie from '@fastify/cookie';
import csrfProtection from '@fastify/csrf-protection';
import fastifyCsrf from '@fastify/csrf-protection';

import { COOKIE_SECRET } from './config'; // ensure it's defined

async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Register plugins in the proper order
  await fastify.register(multipart);

  await fastify.register(helmet);

  await fastify.register(fastifyCookie, {
    secret: COOKIE_SECRET,
  });

  await fastify.register(fastifyCsrf);

  // Your routes go here
  fastify.get('/', async (req, reply) => {
    return { hello: 'world' };
  });

  return fastify;
}

// Start server
void (async () => {
  const server = await buildServer();
  try {
    await server.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
