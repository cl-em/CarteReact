import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";


// Connectez-vous au serveur Socket.IO
const socket = io('http://localhost:8888');

socket.emit("salut");
function test(){
  socket.emit("salut");
}

// let but = document.getElementById("but");
// but.addEventListener("click",test);

function RegisterForm() {
  // Permet de naviger
  const navigate = useNavigate();

  return (
    <div className="register-form">

      <h2>Inscription</h2> <br></br>

      <input type = "text" placeholder="Nom d'utilisateur" id="usernameRegister"></input> <br></br> <br></br>

      <input type = "password" placeholder="Mot de passe" id="passwordRegister"></input> <br></br> <br></br>

      <input type = "password" placeholder="Confirmer le mot de passe" id="passwordRegister2"></input> <br></br> <br></br> <br></br>

      <button>S'inscrire !</button>
      <button onClick={()=>navigate("/")}>Retourner à l'écran de connexion</button>
      
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  axios.defaults.withCredentials = true;
  const onSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8888/login', { username, password })
    .then((response) => {
      if (response.data.validation) {
        navigate("/games");
      } else {
        alert("Mauvais identifiants");
      }
    })
  }
  return (
    <div className="login-form">
      <h2>Connexion</h2>
      <form onSubmit={onSubmit}>
      <br></br>

      <input type = "text" placeholder="Nom d'utilisateur" id="username" value={username} onChange={(e) => setUsername(e.target.value)}></input><br></br>

      <br></br>

      <input type = "password" placeholder="Mot de passe" id="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>

      <br></br>
      <br></br>

      <button type="submit">Envoyer</button>
      </form>
      <p>Vous n'avez pas de compte? Créez en un <p onClick={()=>navigate("/register")} className="lien">ici.</p></p>

    </div>
  );
}

//Permet d'aller dans localhost/games (up)

const MyGame = ({jeu})=>{
  const navigate = useNavigate();
  const [auth, setAuth] = useState(false);
  useEffect(() => {
    axios.get('http://localhost:8888/verify')
    .then((response) => {
      if (response.data.validation) {
        setAuth(true);
      }
      else {
        navigate("/");
      }
    })
  
  })
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

//Defini toutes tes pages ici
function MyApp() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/games" element={<MyGame jeu={"gros zizi"} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default MyApp;