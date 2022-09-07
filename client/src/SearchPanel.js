import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';

import { Form } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroadcastTower } from '@fortawesome/free-solid-svg-icons';
 
export default function SearchPanel({ socket, token, room }) {
  const [search, setSearch]  = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (text) => {
    console.log('Sending Search request to API with query : ', text);
    
    let url = new URL('https://api.spotify.com/v1/search?');
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', 10);
    url.searchParams.set('q', text.trim());
    
    axios.get(url.toString(), {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      }
    }).then((data) => {
      console.log(data);
      setSearchResults(
        data.data.tracks.items.map(track => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image
              return smallest
            },
            track.album.images[0]
          )

          return {
            artists: track.artists.map(a => a.name),
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
            duration: `${Math.floor(track.duration_ms / 60000)}:${String((Math.floor(track.duration_ms / 1000)) % 60).padStart(2, '0')}`
          }
        })
      )
    })
  }

  const debounce = (func, delay) => {
    let timeoutInstance;
    
    return function (...args) {
      
      clearTimeout(timeoutInstance);
      timeoutInstance = setTimeout(() => {
        func(...args);
      }, delay)
    }
  }

  const debouncedSearch = useCallback(debounce(handleChange, 500), []);

  useEffect(() => {
    if(search === '') {
      setSearchResults([]);
      return;
    }

    debouncedSearch(search);
  }, [search]);


  return (
    <div className='d-flex flex-column p-2 flex-grow-1 overflow-hidden'>
        <Form.Control className='mb-4' type='search' placeholder='Search Song/Artist' value={search} onChange={e => setSearch(e.target.value)} />
        <div className='d-flex flex-column p-2 flex-shrink-1' style={{ 'overflow-y':  'auto'}}>
          {searchResults.map(track => (
            <div className='d-flex align-items-center mb-3 p-2 rounded search-result' style={{ background: '#ebebeb'}}>
              <img className='rounded' src={track.albumUrl} style={{ height: "64px", width: "64px" }} />
              <div className='flex-grow-1 ps-3'>
                <div className='col-11 text-truncate' >{track.title}</div>
                <div className="col-11 text-truncate text-muted">{track.artists.join(', ')}</div>
              </div>
              <div className="col-1 d-flex align-items-center justify-content-center">
                <div>{track.duration}</div>
              </div>
              <div className='col-1 d-flex align-items-center justify-content-center'>
                <button class='btn btn-lg btn-primary'><FontAwesomeIcon icon={ faBroadcastTower } /></button>
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}
