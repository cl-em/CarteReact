import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from '../SocketContext';

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
        socket.emit('loadPartieSixQuiPrend', {idPartie: id});
        navigate("/6quiprendJeu?idPartie="+id);
        // socket.on('partieChargee', (data) => {
            
        // });
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
                {sauvegardes.map((sauvegarde, index) => (
                    <div className={"test".concat(index%2)} key={index}>
                        <p>Partie ID :</p>
                        <p>{sauvegarde.id6}</p>
                        <button class="joliebouton" onClick={() => chargerPartie(sauvegarde.id6)}>Charger</button>
                        <button class="joliebouton" onClick={() => supprimerPartie(sauvegarde.id6)}>Supprimer</button>
                    </div>
                ))}
            </ul>
        </div>
    );

}

export default ListeSauvegardesParties6quiprend;