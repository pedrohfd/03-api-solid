import { FastifyInstance } from 'fastify'
import request from 'supertest'

export async function createAndAuthenticateUser(
  app: FastifyInstance,
  isAdmin = false,
) {
  await request(app.server)
    .post('/users')
    .send({
      name: 'John Doe',
      email: 'johndoe@exemple.com',
      password: '123456',
      role: isAdmin ? 'ADMIN' : 'MEMBER',
    })

  const {
    body: { token },
  } = await request(app.server).post('/sessions').send({
    email: 'johndoe@exemple.com',
    password: '123456',
  })

  return { token }
}
