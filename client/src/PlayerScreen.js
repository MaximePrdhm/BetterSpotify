import React from 'react'

import { Container } from 'react-bootstrap'
import RoomDetails from './RoomDetails'


export default function PlayerScreen({socket, user, room, token}) {
  return (
    <div className='player-screen d-flex flex-row'>
      <div className='col-3'>

      </div>
      <div className='col-6'>

      </div>
      <RoomDetails socket={socket} user={user} room={room} token={token} />
    </div>
  )
}
