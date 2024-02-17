import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from './SocketContext';

function ListeSauvegardesParties6quiprend(){
    const socket = useContext(SocketContext);
    const [sauvegardes, setSauvegardes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('getHostPartiesSixQuiPrend', {});
        socket.on('getHostPartiesSixQuiPrend', (data) => {
            setSauvegardes(data);
        });
    }, []);

    function chargerPartie(id){
        socket.emit('loadPartieBataille', {idPartie: id});
        socket.on('partieChargee', (data) => {
            navigate("/6quiprendJeu?idPartie="+id);
        });
    }
    function supprimerPartie(id){
        socket.emit('supprimerPartieSixQuiPrend', {idPartie: id});
        socket.emit('getHostPartiesSixQuiPrend', {});
        socket.on('getHostPartiesSixQuiPrend', (data) => {
            setSauvegardes(data);
        });
    }

    return (
        <div>
            <h1>Liste des sauvegardes</h1>
            <ul>
                {sauvegardes.map((sauvegarde) => (
                    <li key={sauvegarde.idB}>
                        Partie ID : {sauvegarde.idB} <button onClick={() => chargerPartie(sauvegarde.idB)}>Charger</button><button onClick={() => supprimerPartie(sauvegarde.idB)}>Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );

}

export default ListeSauvegardesParties6quiprend;