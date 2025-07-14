import { GoogleGenAI } from "@google/genai";
import env from "../env.ts";

const gemini = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY
});

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
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

  if(!response.text) throw new Error("Não foi possível converter o audio")

  return response.text
}

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

export async function generateAnswer(question: string, transcriptions: string[]){
  const context = transcriptions.join(',')

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

  if(!response.text) throw new Error('Falha ao gerar resposta pelo Gemini')


  return response.text
}