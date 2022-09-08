import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroadcastTower } from '@fortawesome/free-solid-svg-icons';

export default function SearchResult({track, queueAdd}) {
    function handleAdd() {
        queueAdd(track);
    }

    return (
        <div className='d-flex align-items-center mb-3 p-2 rounded search-result' style={{ background: '#ebebeb'}}>
            <img className='rounded' src={track.albumUrl} alt='track image' style={{ height: "64px", width: "64px" }} />
            <div className='flex-grow-1 ps-3'>
                <div className='col-11 text-truncate' >{track.title}</div>
                <div className="col-11 text-truncate text-muted">{track.artists.join(', ')}</div>
            </div>
            <div className="col-1 d-flex align-items-center justify-content-center">
            <div>{track.duration}</div>
            </div>
            <div className='col-1 d-flex align-items-center justify-content-center'>
                <button className='btn btn-lg btn-primary' onClick={handleAdd}><FontAwesomeIcon icon={ faBroadcastTower } /></button>
            </div>
        </div>
  )
}
