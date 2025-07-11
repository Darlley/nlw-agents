PRIMEIRA AULA 

Configuração do servidor com Fastify, Zod. Drizzle e PostgreSQL no Docker com extensão do pgvector.

Regras para o Biome, acesse: [https://www.ultracite.ai/](https://www.ultracite.ai/)

`npx ultracite@latest init`

1. Busca por similaridade > embbedings
2. Banco de dados vetoriais
3. Postgres no Docker com extensão pgvector

Podemos criar as tabelas diretamente no arquivo `.sql` mas para ter melhor controle (com migrations) é melhor usar um ORM como o Drizzle.

Estrutura básica de uma rota com Fastify + Zod para gerar um schema Swagger:

```ts
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

export const getRoomsRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/',
    {
      schema: {
        summary: '',
        tags: [],
        params: {
          name: z.string()
        },
        response: {
          200: z.object({})
        }
      }
    },
    async (request, reply) => {}
  )
}
```

Configuração do Vitejs com shadcn e React Router Dom.

## SEGUNDA AULA

Criação do schema de questions com relacionamento com rooms:

```ts
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { rooms } from "./rooms.ts";

export const questions = pgTable('roons', {
  roonId: uuid().references(() => rooms.id).notNull(),
  //...
})
```

Rode os comendos `db:generate` (drizzle-kit generate) e depois `db:populate` (drizzle-kit migrate). Atualize o Seed.

Criação e inserção de dados pelo drizzle ele sempre retorna um array de contagem de numeros de linhas inseridas, se você quiser o objeto criado deve adicionar `.returning()` no final da query.

