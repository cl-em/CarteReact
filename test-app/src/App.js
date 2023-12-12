import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';

import {Games,ListRoom} from "./Games";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";


const socket = io('http://localhost:8888');

socket.emit("salut");
function test(){
  socket.emit("salut");
}

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
  // Permet de naviger
  const navigate = useNavigate();

  return (
    <div className="login-form">
      <h2>Connexion</h2>

      <br></br>

      <input type = "text" placeholder="Nom d'utilisateur" id="usernameLogin"></input><br></br>

      <br></br>

      <input type = "password" placeholder="Mot de passe" id="passwordLogin"></input>

      <br></br>
      <br></br>

      <button onClick={()=>navigate("/games")}>Envoyer!</button>

      <p>Vous n'avez pas de compte? Créez en un <p onClick={()=>navigate("/register")} className="lien">ici.</p></p>

    </div>
  );
}

//Defini toutes tes pages ici
function MyApp() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/games" element={<Games/>} />
        </Routes>
      </Router>
    </div>
  );
};

export default MyApp;