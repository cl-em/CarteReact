import React, { useContext, useState } from "react";
// import SocketContext from "./SocketContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      axios.post('http://85.215.189.178:8888/register', { username, password })
      .then((response) => {
        if (response.data.validation) {
          navigate("/registerConfirm");
        } else {
          alert("Ce nom d'utilisateur existe déjà");
        }
      })
    } else {
      alert("Les mots de passe ne correspondent pas");
    }
  }
    return (
    <div className="register-form">
      <h2>Inscription</h2> <br></br>
      <form onSubmit={onSubmit}>
        <input type = "text" placeholder="Nom d'utilisateur" value={username} onChange={(e) => setUsername(e.target.value)}></input> <br></br> <br></br>
        <input type = "password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}></input> <br></br> <br></br>
        <input type = "password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}></input> <br></br> <br></br> <br></br>
        <button type="submit">S'inscrire !</button>
        <button onClick={() => navigate("/")}>Retourner à l'écran de connexion</button>
        <p><span id="messageVerifMdp"></span></p>
      </form>
    </div>
  );
}
export default RegisterForm;