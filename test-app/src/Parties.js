import './App.css';
import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import {idJoueur} from './App.js';

import {
    useNavigate
} from "react-router-dom";

function ListePartiesBataille(){
    console.log(idJoueur);
    const navigate = useNavigate();
    const [partiesOuvertes, setPartiesOuvertes] = useState([]);
    const socket = io('http://localhost:8888');
    useEffect(() => {
        socket.emit('parties ouvertes');
        socket.on('parties ouvertes', (data) => {
            console.log('Liste mise à jour : ', data);
            setPartiesOuvertes(data);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    for (let i = 0; i < partiesOuvertes.length; i++) {
        console.log(partiesOuvertes[i]);
    }
    return (

    <div className="listeParties">
        <div className="test1">
            <p>IdPartie</p>
            <p>nbjoueurs/joueursmax</p>
            <p>Bataille</p>
            <button>Rejoindre !</button>
        </div>
        <div className="test2">
        </div>
    </div>

    )

}

export const Parties = ()=>{
    return (<ListePartiesBataille/>);
};