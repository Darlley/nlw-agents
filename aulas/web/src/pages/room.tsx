import { Navigate, useParams } from 'react-router-dom'

type RoomParams = {
  id: string
}

export default function Room() {
  const { id } = useParams<RoomParams>()

  if(!id || id == '' || typeof id === 'undefined') {
    return <Navigate replace to="/" />
  }

  return (
    <div>{id}</div>
  )
}
 