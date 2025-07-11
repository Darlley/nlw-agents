import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

type GetRoomsAPIResponde = Array<{
  id: string
  name: string
}>

export default function CreateRoom() {
  const { data, isLoading } = useQuery({
    queryKey: ['get-rooms'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3333/rooms')
      const result: GetRoomsAPIResponde = await response.json()

      return result
    }
  })

  return (
    <div>
      <p>Create Room</p>
      <p><Link className='underline' to="/room">Acessar sala</Link></p>

      {isLoading && <p>carregando</p>}


      {data && (
        <ul>
          {data.map((room) => (
            <li key={room?.id}>
              <Link to={`/room/${room.id}`}>{room?.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
