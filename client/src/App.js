import io from 'socket.io-client'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AnonymousScreen from './AnonymousScreen';
import LoggedInScreen from './LoggedInScreen';

const socket = io.connect('http://localhost:3001');

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  return (
    code ? <LoggedInScreen code={code} socket={socket} /> : <AnonymousScreen />
  );
}

export default App;
