import React, { useEffect, useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompactDisc, faPeopleGroup, faSignOut } from '@fortawesome/free-solid-svg-icons'

export default function RoomDetails({socket, user, room, token}) {
    
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.emit('user_join_room', { room, user });
    }, [room]);

    useEffect(() => {
        socket.on('user_joined_room', (data) => {
            setUsers((data.users.length > 1) ? [...data.users] : [...users, data.userJoining]);
        });
    
        socket.on('user_left_room', (data) => {
            let index = data.users.findIndex(u => u.id === data.userLeaving.id);
            let users = data.users;
            if(index >= 0) users.slice(index, 1);
            
            setUsers([...users]);
        });
    }, [socket]);

    function handleSignOut() {
        socket.emit('user_leave_room', { room, user });
        window.location  = "/"
    }

    return (
        <div className='col-3 bg-secondary d-flex flex-column overflow-hidden'>
            
            <h3 className='bg-dark text-info p-3 m-0'><FontAwesomeIcon className='me-1 spinning-animation' icon={ faCompactDisc } /> Room</h3>
            <p className='text-light w-100 pt-3 pe-3 lead' style={{ textAlign: 'right'}}>ID - {room}</p>
            <p className='text-light w-100 ps-3 lead'>Logon as {user.display_name}</p>
            <button className='btn btn-lg mx-3 btn-light' onClick={handleSignOut}><FontAwesomeIcon className='me-1' icon={ faSignOut } /> Logout</button>

            <h3 className='bg-dark text-info p-3 m-0 my-4'><FontAwesomeIcon className='me-1' icon={ faPeopleGroup } /> Members</h3>
            <div className='d-flex flex-wrap col-11 mx-auto flex-shrink-1' style={{ 'overflow-y':  'auto'}}>
                {
                    users.map(m => {
                        return <div key={m.id} className='col-12 col-lg-6 pe-0 pe-lg-3 pb-3'>
                            <div className="card col-12">
                                <div className='col-12'>
                                    <img src={m.avatar} alt="User avatar"  className='d-block rounded rounded-circle' style={{ width: "100px", height: "100px", objectFit: "cover", margin: "8px auto"}}/>
                                </div>
                                <h5 className="card-title text-center text-truncate">{m.name}</h5>
                            </div>
                        </div>
                    })
                }
            </div>
            
        </div>
    )
}
