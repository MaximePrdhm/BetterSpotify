import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios';

import { Form } from 'react-bootstrap'

import SearchResult from './SearchResult'

export default function SearchPanel({ socket, token, room }) {
  const [search, setSearch]  = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (text) => {    
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

  const addTrackToQueue = (track) =>  {
      socket.emit('add_track_to_queue',  { track: track, room: room })
  }

  return (
    <div className='d-flex flex-column p-2 flex-grow-1 overflow-hidden'>
        <Form.Control className='mb-4' type='search' placeholder='Search Song/Artist' value={search} onChange={e => setSearch(e.target.value)} />
        <div className='d-flex flex-column p-2 flex-shrink-1' style={{ 'overflow-y':  'auto'}}>
          {searchResults.map(track => (
            <SearchResult track={track} key={track.uri} queueAdd={addTrackToQueue} />
          ))}
        </div>
    </div>
  )
}
