import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from '../SocketContext';

function ListeSauvegardesPartiesBataille(){
    const socket = useContext(SocketContext);
    const [sauvegardes, setSauvegardes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('getHostPartiesBataille', {});
        socket.on('getHostPartiesBataille', (data) => {
            setSauvegardes(data);
        });
    }, []);

    function chargerPartie(id){
        socket.emit('loadPartieBataille', {idPartie: id});
        socket.on('partieChargee', (data) => {
            navigate("/batailleJeu?idPartie="+id);
        });
    }
    function supprimerPartie(id){
        socket.emit('supprimerPartieBataille', {idPartie: id});
        socket.emit('getHostPartiesBataille', {});
        socket.on('getHostPartiesBataille', (data) => {
            setSauvegardes(data);
        });
    }

    return (
        <div>
            {sauvegardes.length === 0 ? (
                <center><h1 style={{ color: 'aliceblue' }}>Aucune sauvegarde</h1></center>
                ) : (
                <center><h1 style={{ color: 'aliceblue' }}>Liste des sauvegardes :</h1></center>
            )}
            <ul>
                {sauvegardes.map((sauvegarde, index) => (
                    <div className={"test".concat(index%2)} key={index}>
                        <p>Partie ID :</p>
                        <p>{sauvegarde.idB}</p>
                        <button class="joliebouton" onClick={() => chargerPartie(sauvegarde.idB)}>Charger</button>
                        <button class="joliebouton" onClick={() => supprimerPartie(sauvegarde.idB)}>Supprimer</button>
                    </div>
                ))}
            </ul>
            <button class="joliebouton" onClick={()=>navigate("/bataille")}>Accueil Bataille</button>
            <button class="joliebouton" onClick={()=>navigate("/ListePartiesRejointes")}>Liste Parties Rejointes</button>
            <button class="joliebouton" onClick={()=>navigate("/games")}>Revenir au menu de sélection des jeux</button>
        </div>
    );

}

export default ListeSauvegardesPartiesBataille;