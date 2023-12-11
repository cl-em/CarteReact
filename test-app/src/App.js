import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
// Connectez-vous au serveur Socket.IO
const socket = io('http://localhost:8888');

socket.emit("salut");
function test(){
  socket.emit("salut");
}

// let but = document.getElementById("but");
// but.addEventListener("click",test);


function MyButton({prop}) {
  return (
    <button id={prop} onClick={test}>
      I'm a button
    </button>
  );
}


// c'est le truc qui est affiché tout le temps ça peut juste etre un appel de fonction
export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton prop={"but"} />
    </div>
  );
}
