import { useState, useEffect } from 'react'

import { Container } from 'react-bootstrap'

//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faCircleNotch } from '@fortawesome/free-solid-svg-icons' 

import PlayerScreen from  './PlayerScreen'
import useAuth from './useAuth'
import axios from 'axios'

export default function LoggedInScreen({ code, socket }) {
    const accessToken = useAuth(code);

    const [user, setUser] = useState(null);
    const [room, setRoom] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false);

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
            //console.log(data.data);
        }).catch((err) => {
            console.log(err)
        });
    }, [accessToken]);

    return showPlayer ? <PlayerScreen /> : (
        <Container className='d-flex justify-content-center align-items-center' style={{ minHeight: "100vh" }}>
            { user ? "Hello user" : /*<FontAwesomeIcon icon={faCircleNotch} className='loading-animation'/>*/ "Waiting" }
        </Container>
    ) 
}
