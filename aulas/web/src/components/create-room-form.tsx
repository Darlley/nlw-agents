import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"

import { useCreateRoom } from "@/hooks/use-create-room"
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Input } from "./ui/input"

const createRoomSchema = z.object({
  name: z.string().min(3, { message: "Inclua no minimo 3 caracteres" }),
  description: z.string()
})

type CreateRoomFormData = z.infer<typeof createRoomSchema>

export default function CreateRoomForm() {
  const { mutateAsync: createRoom, isPending } = useCreateRoom()
  const createRoomForm = useForm({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  async function handleCreateRoom({ name, description }: CreateRoomFormData) {
    try {
      await createRoom({ name, description })
      createRoomForm.reset()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar sala</CardTitle>
        <CardDescription>
          Crie uam nova sala para começar a fazer perguntas e receber respostas
          da I.A.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...createRoomForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={createRoomForm.handleSubmit(handleCreateRoom)}
          >
            <FormField
              control={createRoomForm.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Nome da sala</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o nome da sala..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <FormField
              control={createRoomForm.control}
              name="description"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar sala"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
