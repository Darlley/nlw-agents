import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schemas/index.ts";
import { count, eq } from "drizzle-orm";

export const getRoomsRoute: FastifyPluginAsyncZod = async app => {
  app.get('/rooms', async (request, reply) => {
    const results = await db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
        questionsCount: count(schema.questions.id),
        createdAt: schema.rooms.createdAt
      })
      .from(schema.rooms)
      .leftJoin(schema.questions, eq(schema.questions.roomId, schema.rooms.id))
      .groupBy(schema.rooms.id)
      .orderBy(schema.rooms.createdAt)
    return results
  })
}