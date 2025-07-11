import { desc, eq } from "drizzle-orm";
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schemas/index.ts";

export const getRoomQuestionsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/rooms/:roomId/questions', 
    {
      schema: {
        params: z.object({
          roomId: z.string()
        })
      }
    },
    async (request, reply) => {
      const { roomId } = request.params

      const results = await db
        .select()
        .from(schema.questions)
        .where(eq(schema.questions.roomId, roomId))
        .orderBy(desc(schema.questions.createdAt))

      return results
    }
  )
}