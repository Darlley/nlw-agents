import type { CreateQuestionRequest, CreateQuestionResponse, GetRoomsQuestionsResponse } from "@/types/questions.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateQuestion(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await fetch(`http://localhost:3333/rooms/${roomId}/questions`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result: CreateQuestionResponse = await response.json()
      return result
    },

    onMutate: ({ question }) => {
      const questions = queryClient.getQueryData<GetRoomsQuestionsResponse>(['get-questions', roomId])

      const questionsArray = questions ?? []
      const newQuestion = {
        id: crypto.randomUUID(),
        question,
        answer: null,
        createdAt: new Date().toISOString(),
        isGeneratingAnswer: true
      }

      queryClient.setQueryData<GetRoomsQuestionsResponse>(
        ['get-questions', roomId],
        [
          newQuestion,
          ...questionsArray
        ]
      )

      return {
        newQuestion, questions
      }
    },

    onSuccess: (data, _varaibles, context) => {
      queryClient.setQueryData<GetRoomsQuestionsResponse>(
        ['get-questions', roomId],
        questions => {
          if (!questions) return questions
          if (!context.newQuestion) return questions

          return questions.map(question => {
            if (question.id === context.newQuestion.id) {
              return {
                ...context.newQuestion,
                id: data.questionId,
                answer: data.answer,
                isGeneratingAnswer: false
              }
            }

            return question
          })
        }
      )
    },

    onError: (_error, _variables, context) => {
      if (context?.questions) {
        queryClient.setQueryData<GetRoomsQuestionsResponse>(
          ['get-questions', roomId],
          context.questions
        )
      }
    }
  })
}