import io from 'socket.io-client'

import './App.css';

const socket = io.connect('http://localhost:3001');

function App() {
  return (
    <div className="App">
    </div>
  );
}

export default App;
