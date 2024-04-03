import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
function LoginForm() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    axios.defaults.withCredentials = true;
    const onSubmit = (e) => {
      e.preventDefault();
      axios.post('http://85.215.189.178:8888/login', { username, password })
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
        <div>Vous n'avez pas de compte? Créez en un <p onClick={()=>navigate("/register")} className="lien">ici.</p></div>
      </div>
    );
  }

export default LoginForm;