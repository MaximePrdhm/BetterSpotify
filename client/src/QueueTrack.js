import { useState } from 'react'
import { Form } from 'react-bootstrap'

export default function QueueTrack({ track, updateTrackSelection }) {
    const [isSelected, setIsSelected] = useState(false);
    
    function handleCheckboxChange(e) {
        updateTrackSelection(track.uri, e.target.checked);
    }

    return (
        <div className='col-12 mb-3 rounded d-flex bg-light'>
            <div className='col-1 mx-2 d-flex align-items-center'>
                <Form.Control className='form-check-input' type='checkbox' onChange={handleCheckboxChange} style={{ height: '25px', width: '25px' }} />
            </div>
            <img className='rounded my-2' src={track.albumUrl} alt='track image' style={{ height: "64px", width: "64px" }} />
            <div className='flex-grow-1 ps-3 d-flex flex-column justify-content-center'>
                <div className='col-11 text-truncate' >{track.title}</div>
                <div className="col-11 text-truncate text-muted">{track.artists.join(', ')}</div>
            </div>
            <div className="mx-2 d-flex align-items-center justify-content-center col-2">
                <div>{track.duration}</div>
            </div>
        </div>
    )
}
