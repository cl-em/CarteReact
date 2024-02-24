import '../App.css';
import SocketContext from '../SocketContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { WavyContainer, WavyLink } from "react-wavy-transitions";

function DivTexte(){
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);

    return (
        <div className='avertissement'>
            <div className='avertissement-texte'>
                <h3 style={{ color: 'aliceblue' }}>Vous vous apprêtez a complétement changer d'univers, il est préférable pour vous de rebrousser chemin</h3>
            </div>

            <br></br>

            <div className='avertissement-bouton'>
                <button className='joliebouton' onClick={()=>navigate("/games")}>Rebrousser chemin!</button>
                <div><WavyLink to="/magic" color="#840fa1">Ne pas écouter l'avertissement</WavyLink></div>
            </div>
        </div>
    );
}

export const ChangementUnivers = ()=>{
    return (<DivTexte/>);
};
