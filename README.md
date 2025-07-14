# NLW AGENTS

Construimos um projeto fullstack para criar salas e perguntas, em cada sala gravamos audios que é utilizado para responder perguntas dos alunos pelo agente de IA. A aplicação foi construida com Vitejs + Tanstack Query no Frontend e Fastify + Drizzle ORM no Backend.

![certificate_pages-to-jpg-0001](https://github.com/user-attachments/assets/28d01c3b-c554-4d92-b716-ad2d6b7e6975)

- FRONTEND: Vitejs, Tanstack Query, React Router Dom, shadcn, Zod.
- BACKEND: Fastify, PostgreSQL, Drizzle ORM, Gemini API.
- OUTROS: Zod, TypeScript e Biome.

Ao gravar um áudio, enviamos o blob do audio sendo gravado a cada 5 segundos para que o backend transcreva o audio para texto usando o modelo `gemini-2.5-flash` e em seguida transformando o conteúdo de texto para embeddings com o modelo `text-embedding-004` da gemini, e armazenamos no container Docker de PostgreSQL com a extensão `vector` (usando a imagem `pgvector`).

Para transcrever audios precisamos iniciar a gravação do audio ao clicar em um botão e enviar o arquivo webm para o backend:

```tsx
const recorder = useRef<MediaRecorder | null>(null)

async function startRecording() {
  const audio = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44_100
    }
  })

  recorder.current = new MediaRecorder(audio, {
    mimeType: 'audio/webm', // codex
    audioBitsPerSecond: 64_000
  })

  recorder.current.ondataavailable = (event) => event.data.size > 0 && uploadAudio(event.data)
  recorder.current.onstart = () => console.log("Gravação iniciada!")
  recorder.current.onstop = () => console.log("Gravação encerrada!")
  recorder.current.start()
}

async function uploadAudio(audio: Blob) {
  const formData = new FormData()
  formData.append('file', audio, 'audio.webm')

  const response = await fetch(`http://localhost:3333/rooms/${params.roomId}/audio`, {
    method: 'POST',
    body: formData
  })

  const result = await response.json()
}
``` 

No backend precisamos converter o file recebido na requisição para um buffer e depois para base64:

```ts
app.post('/rooms/:roomId/audio', async (request, reply) => {
  const audio = await request.file()
  const audioBuffer = await audio.toBuffer()
  const audioAsBase64 = audioBuffer.toString('base64')
})

```

Em seguida enviamos o base64 do audio para a api do Gemini:

```ts
const response = await gemini.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      text: "Transcreva o audio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em paragrafos quando for apropriado."
    }, 
    {
      inlineData: {
        mimeType,
        data: audioAsBase64
      }
    }
  ]
});
```

Agora basta fazer embedding do `response.text`. Quando um aluno cria uma pergunta também criamos os embeddings da pergunta: 

```ts
export async function generateEmbeddings(text: string) {
  const response = await gemini.models.embedContent({ 
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT'
    }
  })

  if(!response.embeddings?.[0].values) throw new Error("Não foi possivel gerar s embeddings")

  return response.embeddings?.[0].values
}
```

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/26ed38fd-9170-41ef-b324-6060f9192134" />

Com ajuda do Drizzle criamos uma Query para fazer uma busca de similaridade entre a pergunta e nossos embeddings disponíveis:

```ts
const chunks = await db
  .select({
    id: schema.audioChunks.id,
    transcription: schema.audioChunks.transcription,
    similarity: sql<number>`1 - (${schema.audioChunks.embeddings} <=> ${embbedingsAsString}::vector)`
  })
  .from(schema.audioChunks)
  .where(
    and(
      eq(schema.audioChunks.roomId, roomId),
      sql`1 - (${schema.audioChunks.embeddings} <=> ${embbedingsAsString}::vector) > 0.7`
    )
  )
  .orderBy(sql`${schema.audioChunks.embeddings} <=> ${embbedingsAsString}::vector`)
  .limit(5)
```

E se existir geramos uma resposta com ajuda da API do Gemini novamente:

```ts
const prompt = `
  ### OBJETIVO
  Você é um agente educacional que responde perguntas de alunos com base com conteúdos ja existentes. Com base no context fornecido abaixo no contexto, responda a pergunta de forma clara e precisa em português.

  ### CONTEXTO PARA RESPOSTAS
  ${context}

  ### PERGUNTA 
  ${question}

  ### INSTRUÇÕES
  - Busque apenas informações contidas no contexto enviado.
  - Se a resposta não for encontrada no contexto apenas responda que  não possui informações suficientes para responder.
  - Seja objetivo e mantenha um tom educativo e profissional.
  - Cite trechos relevanes do contexto, se apropriado, e utilize o termo "Conteúdo da aula".
`.trim()

const response = await gemini.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    {
      text: prompt
    }
  ]
})
```
