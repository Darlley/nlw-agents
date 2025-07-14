import { reset, seed } from "drizzle-seed"
import { db, sql } from "./connection.ts"
import { schema } from "./schemas/index.ts"

await reset(db, schema)
await seed(db, schema).refine((f) => {
  return {
    rooms: {
      count: 5,
      columns: {
        name: f.companyName(),
        description: f.loremIpsum(),
        createdAt: f.default({ defaultValue: new Date() }),
      }
    },
    questions: {
      count: 10
    }
  }
})

await sql.end()

console.log('db seeded')
