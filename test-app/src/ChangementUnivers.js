import './App.css';
import SocketContext from './SocketContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function DivTexte(){
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    const [buttonStyle, setButtonStyle] = useState({
            position: 'fixed',
            left: `27vw`,
            top: `56vh`,
    });

    useEffect(() => {
        document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table_spooky.png")`;

        return () => {
            document.body.style.backgroundColor = '';
        };

    }, []);

    const moveButton = () => {
        
        const X = Math.random() * 90
        const Y = Math.random() * 90

        setButtonStyle({
            position: 'fixed',
            left: `${X}vw`,
            top: `${Y}vh`,
        });
    };

    return (
        <div className='avertissement'>
            <div className='avertissement-texte'>
                <h3 style={{ color: 'aliceblue' }}>Vous vous apprêtez a complétement changer d'univers, il est préférable pour vous de rebrousser chemin</h3>
            </div>

            <br></br>

            <div className='avertissement-bouton'>
                <button className='joliebouton2' style={buttonStyle} onClick={()=>navigate("/games")} onMouseEnter={moveButton} >Rebrousser chemin</button>
                <button className='joliebouton2' onClick={()=>navigate("/magic")}>Ne pas écouter l'avertissement</button>
            </div>
        </div>
    );
}

export const ChangementUnivers = ()=>{
    return (<DivTexte/>);
};
