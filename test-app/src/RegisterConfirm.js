import React from 'react';
import { useNavigate } from "react-router-dom";
function RegisterConfirm(){
    const navigate = useNavigate();
    return(
        <div className="register-confirm">
        <h2>Votre inscription a bien été effectuée!</h2> <br></br> <br></br>
        <button onClick={() => navigate("/")}>Retourner à l'écran de connexion</button>
        </div>
    )
}
export default RegisterConfirm;