import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { schema } from "../../db/schemas/index.ts";
import { db } from "../../db/connection.ts";

export const createQuestionRoute: FastifyPluginAsyncZod = async app => {
  app.post('/rooms/:roomId/questions', 
    {
      schema: {
        params: z.object({
          roomId: z.string()
        }),
        body: z.object({
          question: z.string().min(1)
        })
      }
    },
    async (request, reply) => {
      const { roomId } = request.params
      const { question } = request.body

      const result = await db.insert(schema.questions).values({ 
        roomId,
        question
      }).returning()

      const insertedQuestion = result[0]

      if(!insertedQuestion) {
        throw new Error('Failed to created new room')
      }

      return reply.status(201).send({ questionId: insertedQuestion.id })
    }
  )
}