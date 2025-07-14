import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRooms } from '@/hooks/use-rooms'
import { formatTime } from '@/utils/format-date'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function RoomList() {
  const { data, isLoading } = useRooms()
  return (
    <Card >
      <CardHeader>
        <CardTitle>Acesso rápido para as salas creadas recentemente</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isLoading && <p>Carregando salas...</p>}
        {data?.map((room) => (
          <Link
            key={room?.id}
            to={`/room/${room.id}`}
            className='flex items-center justify-between rounded-lg p-3 border hover:bg-accent'
          >
            <div className='flex-1 flex flex-col gap-1'>
              <h3 className='font-medium'>{room?.name}</h3>
              <div className='flex items-center gap-2'>
                <Badge variant="secondary" className='text-xs'>{formatTime(room?.createdAt)}</Badge>
                <Badge variant="outline" className='text-xs'>{room?.questionsCount} pergunta (s)</Badge>
              </div>
            </div>

            <span className='flex items-center gap-1 text-sm'>Entrar <ArrowRight className='size-3' /></span>
          </Link>
        ))}
      </CardContent>
    </Card >
  )
}
