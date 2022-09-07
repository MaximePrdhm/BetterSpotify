import React from 'react'

import RoomDetails from './RoomDetails'
import SearchPanel from './SearchPanel'

export default function PlayerScreen({socket, user, room, token}) {
  return (
    <div className='player-screen d-flex flex-row'>
      <div className='col-3'>

      </div>
      <div className='col-6 d-flex flex-column'>
        <SearchPanel socket={socket} room={room} token={token} />
        <div>Player</div> 
      </div>
      <RoomDetails socket={socket} user={user} room={room} token={token} />
    </div>
  )
}
