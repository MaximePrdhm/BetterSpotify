import { useEffect, useState } from 'react'

import QueueTrack from './QueueTrack';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faShuffle, faArrowsRotate, faTrash } from '@fortawesome/free-solid-svg-icons'


export default function QueuePanel({ socket, room, user }) {
    const [queuedTracks, setQueuedTracks] = useState([]);
    
    const [selectedTracks, setSelectedTracks] = useState([]);

    useEffect(() => {
        socket.on('user_joined_room', (data) => {
            if(data.users.length > 1)
                setQueuedTracks([...data.queue]);
        });

        socket.on('track_added_to_queue', (data) => {
            setQueuedTracks([...queuedTracks, data.trackAdded]);
        })

        return () => socket.off('track_added_to_queue');
    }, [socket, queuedTracks]);

    useEffect(() => {
        socket.on('queue_reset', (data) => {
            setQueuedTracks([...data.queue]);
        });

        socket.on('queue_shuffled', (data) => {
            setQueuedTracks([...data.queue]);
        });

        socket.on('queue_tracks_deleted', (data) => {
            setQueuedTracks([...data.queue]);
        });
    }, [])

    function handleReset() {
        socket.emit('queue_reset_request', { room, user });
    }

    function handleShuffle() {
        socket.emit('queue_shuffle_request', { room, user });
    }

    const handleTrackSelectionUpdate = (track, isSelected) =>  {
        if(isSelected)
            setSelectedTracks([...selectedTracks, track]);
        else {
            const tracks = selectedTracks;
            let index = tracks.findIndex(t => t === track);
            if(index >= 0) tracks.splice(index, 1);

            setSelectedTracks([...tracks]);
        }
    }

    function handleDelete() {
        socket.emit('queue_delete_request', { room, user, tracks: selectedTracks });
        
        setSelectedTracks([]);
    }

    useEffect(() => {
        document.getElementById('delete-queue-tracks-btn').disabled = selectedTracks.length === 0;
    }, [selectedTracks])

    return (
        <div className='col-3 bg-secondary d-flex flex-column overflow-hidden'>
            <h3 className='bg-dark text-info p-3 m-0'><FontAwesomeIcon className='me-1' icon={ faLayerGroup } /> Queue</h3>
            
            <div className='my-3 col-11 mx-auto d-flex flex-wrap'>
                <button className='btn btn-md btn-light me-auto' style={{ width: '47.5%'}} onClick={handleShuffle}><FontAwesomeIcon className='me-1' icon={ faShuffle } /> Shuffle</button>
                <button className='btn btn-md btn-light ms-auto' style={{ width: '47.5%'}} onClick={handleReset}><FontAwesomeIcon className='me-1' icon={ faArrowsRotate } /> Reset</button>
                <button className='btn btn-md mt-3 btn-danger w-100' id='delete-queue-tracks-btn' onClick={handleDelete}><FontAwesomeIcon className='me-1' icon={ faTrash } /> Remove selected items {selectedTracks.length > 0 ? `(${selectedTracks.length})` : ''}</button>
            </div>
            
            <div className='d-flex flex-wrap col-11 mx-auto flex-shrink-1' style={{ 'overflow-y':  'auto'}} >
                {
                    queuedTracks.map(t => {
                        return <QueueTrack track={t} key={t.uuid} updateTrackSelection={handleTrackSelectionUpdate} />
                    })
                }
            </div>
        </div>
    )
}
