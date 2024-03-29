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
            {sauvegardes.length === 0 ? (
                <center><h1 style={{ color: 'aliceblue' }}>Aucune sauvegarde</h1></center>
                ) : (
                <center><h1 style={{ color: 'aliceblue' }}>Liste des sauvegardes :</h1></center>
            )}
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
            <button class="joliebouton" onClick={()=>navigate("/6quiprend")}>Accueil 6quiprend</button>
            <button class="joliebouton" onClick={()=>navigate("/ListePartiesRejointes")}>Liste Parties Rejointes</button>
            <button class="joliebouton" onClick={()=>navigate("/games")}>Revenir au menu de sélection des jeux</button>
        </div>
    );

}

export default ListeSauvegardesParties6quiprend;