import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";


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

const MyGame = ({jeu})=>{
  return (
    <div style={{
      backgroundColor:"blue",
      // height:"300px",
      width: "250px",
      margin :"10px",
      textAlign : "center",
      padding: "250px 0"
    }}>
      <p>{jeu}</p>
    </div>
  )

}


function MyApp() {
  

  return (
<<<<<<< HEAD
        <LoginForm />
=======
    <div className="container">
        <Router>
                <Routes>
                    <Route
                        exact
                        path="/"
                        component={LoginForm}
                    />
                    <Route
                        exact
                        path="/games"
                        component={MyGame}
                    />
                </Routes>
            </Router>
    </div>
>>>>>>> 52e2c70 (views)
  );
}

export default MyApp;