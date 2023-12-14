import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';
// import { useState } from 'react';
import md5 from 'md5';
import React, { useState, useEffect } from 'react';
// import { useHistory } from 'react-router-dom';

// import {} from Bataille;

import {Games} from "./Games";
import {Parties} from "./Parties";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";
import { Bataille ,Lobby} from './Bataille';


const socket = io('http://localhost:8888');

socket.emit("salut");
// elouand met ton code ici


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

        <input type = "password" placeholder="Mot de passe" id="passwordRegister" name={"password"}></input> <br></br> <br></br>

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
export let idJoueur;
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
      // navigate("/games"); //a virer si username + password pas dans la bdd
    }
  }

  socket.on("login",(reponse)=>{
    console.log(reponse);
    if(reponse){
      idJoueur=reponse;
      navigate("/games");
    }
  })

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

function ListePartiesBataille(){
  const navigate = useNavigate();
  const [partiesOuvertes, setPartiesOuvertes] = useState([]);
  useEffect(() => {
      socket.emit('demandepartiesouvertes', 'Bataille');
      socket.on('parties ouvertes bataille', (data) => {
          // console.log('Liste mise à jour : ', data);
          setPartiesOuvertes(data);
      });
  }, [partiesOuvertes]);

  const rejoindrePartie = (idPartie) => {
      socket.emit('rejoindre partie bataille', idPartie);
  }
  return (
  <div className='joinpartieID'>
    <input type="text" placeholder="Id de la partie" id="idPartie"></input>
    <button onClick={()=>rejoindrePartie(document.getElementById("idPartie").value)}>Rejoindre !</button>
  <div className="listeParties">
    {/* input text de l'id de la partie */}
    {partiesOuvertes.map((partie,index)=>{
      return(
        <div className={"test".concat(index%2)} key={index}>
          <p>{partie.id}</p>
          <p>{partie.joueursActuels}/{partie.joueursMax}</p>
          <p>Bataille</p>
          {/* <button onClick={()=>navigate("/bataille")}>Rejoindre !</button> */}
          <button onClick={()=>rejoindrePartie(partie.id)}>Rejoindre !</button>
        </div>
      )
    })}
  </div>
  </div>

  )

}

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('message', (msg) => {
      setMessages((messages) => [...messages, msg]);
    });
    return () => socket.off("message");
  }, []);

  const sendMessage = () => {
    socket.emit('message', message);
    setMessage('');
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
      />
      <button onClick={sendMessage}>Envoyer</button>
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
          {/* <Route path="/register" element={} /> */}
          {/* <Route path="/" element={<LoginForm />} />   */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/registerConfirm" element={<RegisterConfirm />} />
          <Route path="/games" element={<Games/>} />
          <Route path="/bataille" element={<ListePartiesBataille/>} />
          {/* <Route path="/bataille" element={<Test2/>}/> */}

          <Route path='/test'element={<Lobby listesjoueurs={[]} nbjoueurs={7} joueursmax={11}/>}/>

          <Route path="/chat" element={<Chat/>} />
        </Routes>
      </Router>
    </div>
  );
};
export default MyApp;