import { useState, useEffect } from 'react'

import { Container } from 'react-bootstrap'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons' 

import PlayerScreen from  './PlayerScreen'
import useAuth from './useAuth'
import axios from 'axios'

export default function LoggedInScreen({ code, socket }) {
    const accessToken = useAuth(code);

    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);

    useEffect(() => {
        if(!accessToken) return;

        axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken
            }
        }).then((data) => {
            setUser(data.data); 
        }).catch((err) => {
            console.log(err)
        });
    }, [accessToken]);

    function handleCreateRoom() {
        socket.emit("create_room", { user: user });
    }

    function handleJoinRoom() {
        socket.emit("join_room", { user: user, room: document.getElementById('room-field').value });
    }

    socket.on('room_error', (data) => {
        const target = document.getElementById('room-validation');

        if(data.error === 'room_not_found') {
            target.innerText = `Room ${data.data} does not exist.`
        } else if(data.error === 'room_argument_invalid') {
            target.innerText = 'Room ID can not be empty.'
        }
    });

    socket.on('room_joined',  (data) => {
        setRoom(data.room);
    });

    return room ? <PlayerScreen socket={socket} user={user} room={room} token={accessToken}/> : (
        <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: "100vh" }}>
            { 
                user ? (
                    <Container className='w-50 d-flex flex-column justify-content-center align-items-center rounded py-3' style={{ boxShadow: "25px 25px 30px #b8b8b8, -25px -25px 30px #ffffff", background: "#e6e6e6"}}>
                        <img src={user.images[0].url} alt='user avatar' className='rounded' style={{ width: "125px", height: "125px", objectFit: "cover"}}/>
                        <p className='lead my-2 text-center'>Welcome <b>{user.display_name}</b> !</p>

                        <a className='btn btn-primary btn-md w-75' onClick={handleCreateRoom} >Create Room</a>
                        <p className='lead my-2'>Or</p>
                        <input id='room-field' className='form-control w-75' placeholder='Room ID' type='number' min='10000000' max='99999999' />
                        <a className='btn btn-primary btn-md w-75 mt-1' onClick={handleJoinRoom} >Join Room</a>

                        <p id='room-validation' className='text-danger text-center'></p>
                    </Container>
                ) : (
                    <FontAwesomeIcon icon={faCircleNotch} className='spinning-animation'/>
                )
            }
        </Container>
    ) 
}
