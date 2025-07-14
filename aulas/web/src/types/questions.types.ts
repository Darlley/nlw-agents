export type GetRoomsQuestionsResponse = Array<{
  id: string
  question: string
  answer: string | null
  createdAt: string
  isGeneratingAnswer?: boolean
}>

export type CreateQuestionRequest = {
  question: string
}

export type CreateQuestionResponse = {
  questionId: string
  answer: string | null
}