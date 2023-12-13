import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
import md5 from 'md5';

import {Games} from "./Games";
import {Parties} from "./Parties";

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

  const emitRegister = () => {
    document.getElementById("messageVerifMdp").textContent = "";
    let username = document.getElementById("usernameRegister").value;
    let password = "";
    let passwordVerif = "";

    if(document.getElementById("passwordRegister").value !== ""){
      password = md5(document.getElementById("passwordRegister").value);
    }
  
    if(document.getElementById("passwordRegister2").value !== ""){
      passwordVerif = md5(document.getElementById("passwordRegister2").value);
    }
  
    if((username !== "") && (password !== "") && (passwordVerif !== "") && (password===passwordVerif)){
      socket.emit("register", {"pseudo":username, "password":password})
      navigate("/registerConfirm");
    }
    else{
      document.getElementById('messageVerifMdp').textContent = "**Veuillez remplir tout les champs et vérifier que vos mots de passe correspondent !";
    }
  }

  return (
    <div className="register-form">

      <h2>Inscription</h2> <br></br>

        <input type = "text" placeholder="Nom d'utilisateur" id="usernameRegister"></input> <br></br> <br></br>

        <input type = "password" placeholder="Mot de passe" id="passwordRegister"></input> <br></br> <br></br>

        <input type = "password" placeholder="Confirmer le mot de passe" id="passwordRegister2"></input> <br></br> <br></br> <br></br>

        <button onClick={emitRegister}>S'inscrire !</button>

        <button onClick={() => navigate("/")}>Retourner à l'écran de connexion</button>

        <p><span id="messageVerifMdp"></span></p>
      
    </div>
  );
}

function RegisterConfirm(){
  const navigate = useNavigate();
  return(
    <div className="register-confirm">
      <h2>Votre inscription a bien été effectuée!</h2> <br></br> <br></br>
      <button onClick={() => navigate("/")}>Retourner à l'écran de connexion</button>
    </div>
  )
}

function LoginForm() {
  // Permet de naviger
  const navigate = useNavigate();

  const emitLogin = () => {
    let username = document.getElementById("usernameLogin").value;
    let password = "";
    
    if(document.getElementById("passwordLogin").value !== ""){
        password = md5(document.getElementById("passwordLogin").value);
    } 
    
    console.log(username, password);
    
    if((username !== "") && (password !== "")){ //ajouter verif bdd
      socket.emit("login", {"pseudo":username,"password":password});
      navigate("/games"); //a virer si username + password pas dans la bdd
    }
  }

  return (
    <div className="login-form">
      <h2>Connexion</h2>

      <br></br>

      <input type="text" placeholder="Nom d'utilisateur" id="usernameLogin"></input><br></br>

      <br></br>

      <input type = "password" placeholder="Mot de passe" id="passwordLogin"></input>

      <br></br>
      <br></br>

      <button onClick={emitLogin}>Envoyer!</button>

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
          <Route path="/registerConfirm" element={<RegisterConfirm />} />
          <Route path="/games" element={<Games/>} />
          <Route path="/bataille" element={<Parties/>} />
        </Routes>
      </Router>
    </div>
  );
};

export default MyApp;