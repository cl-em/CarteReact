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

function LoginForm() {

  return (
    <div className="login-form">
      <h2>Login</h2>

      <br></br>

      <input type="text" placeholder="Username" id="username"></input> <br></br>

      <br></br>

      <input type="password" placeholder="Password" id="password"></input> <br></br>

      <br></br>

      <button>Connect!</button>

      <br></br>

      <div className='register'>
        <p>A remplacer par une </p>
      </div>

    </div>
  );
}

function MyApp() {
  return (
        <LoginForm />
  );
}

export default MyApp;