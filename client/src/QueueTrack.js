import { Form } from 'react-bootstrap'

export default function QueueTrack({ track, updateTrackSelection }) {
    function handleCheckboxChange(e) {
        updateTrackSelection(track.uuid, e.target.checked);
    }

    return (
        <div className='col-12 mb-3 rounded d-flex bg-light'>
            <div className='col-1 mx-2 d-flex align-items-center'>
                <Form.Control className='form-check-input' type='checkbox' onChange={handleCheckboxChange} style={{ height: '25px', width: '25px' }} />
            </div>
            <img className='rounded my-2' src={track.albumUrl} alt='track image' style={{ height: "64px", width: "64px" }} />
            <div className='flex-shrink-1 col-6 ps-3 d-flex flex-column justify-content-center'>
                <div className='text-truncate flex-shrink-1' >{track.title}</div>
                <div className="text-truncate flex-shrink-1 text-muted">{track.artists.join(', ')}</div>
            </div>
            <div className="mx-2 d-flex align-items-center justify-content-center col-2">
                <div className='ps-4'>{track.duration}</div>
            </div>
        </div>
    )
}
