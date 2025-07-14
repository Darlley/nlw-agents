import { sql } from './db/connection.ts'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import env from './env.ts'
import { getRoomsRoute } from './http/routes/get-rooms.ts'
import { createRoomsRoute } from './http/routes/create-rooms.ts'
import { getRoomQuestionsRoute } from './http/routes/get-room-questions.ts'
import { createQuestionRoute } from './http/routes/create-question.ts'
import { uploadAudioRoute } from './http/routes/upload-audio.ts'
import fastifyMultipart from '@fastify/multipart'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: "http://localhost:5173"
})

app.register(fastifyMultipart)

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.get("/health", () => {
  return 'ok'
})

app.register(getRoomsRoute)
app.register(createRoomsRoute)
app.register(getRoomQuestionsRoute)
app.register(createQuestionRoute)
app.register(uploadAudioRoute)

app.listen({ port: env.APP_PORT }).then(() => console.log('app listen'))