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
      Username : <input type = "text" id="username"></input>
      Password : <input type = "password" id="password"></input>
      <br></br>
      <button>Connect!</button>
    </div>
  );
}

function RegisterForm() {
  return (
    <div className="register-form">
      <h2>Register</h2>
      <br></br>
      <button>Register !</button>
    </div>
  );
}

function MyApp() {
  return (
    <div className="container">
      <div className="left-pane">
        <LoginForm />
      </div>
      <div className="right-pane">
        <RegisterForm />
      </div>
    </div>
  );
}

export default MyApp;