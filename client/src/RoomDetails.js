import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompactDisc, faPeopleGroup, faSignOut } from '@fortawesome/free-solid-svg-icons'

export default function RoomDetails({socket, user, room, token}) {
    
    function handleSignOut() {
        window.location  = "/"
    }
    
    return (
        <div className='col-3 bg-secondary'>
            <h3 className='bg-dark text-info p-3 m-0'><FontAwesomeIcon className='me-1 spinning-animation' icon={ faCompactDisc } /> Room</h3>
            <p className='text-light w-100 pt-3 pe-3 lead' style={{ textAlign: 'right'}}>ID - {room.id}</p>
            <p className='text-light w-100 ps-3 lead'>Logon as {user.display_name}</p>
            <button className='btn btn-lg ms-3 btn-light' onClick={handleSignOut}><FontAwesomeIcon className='me-1' icon={ faSignOut } /> Logout</button>

            <h3 className='bg-dark text-info p-3 m-0 my-4'><FontAwesomeIcon className='me-1' icon={ faPeopleGroup } /> Members</h3>
            <div className='d-flex flex-wrap col-11 mx-auto'>
                {room.members.map(m => {
                    return <div key={m.id} className='col-6 pe-3 pb-3'>
                        <div className="card col-12">
                            <div className='col-12'>
                                <img src={m.images[0].url} alt="User avatar"  className='d-block rounded rounded-circle' style={{ width: "100px", height: "100px", objectFit: "cover", margin: "8px auto"}}/>
                            </div>
                            <h5 className="card-title text-center">{m.display_name}</h5>
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}
