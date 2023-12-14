import './App.css';
import {idJoueur} from './App.js';
import {io} from "socket.io-client";


import {
    useNavigate
} from "react-router-dom";

const socket = io('http://localhost:8888');

// let IdJoueur;



// socket.emit("infoLobby", idJoueur, IdPartie); 

socket.on("infoLobby", (data) => { //liste de joueurs (liste de json), taille du paquet, liste de cartes, carte avec valeur et couleur comme attribut
    // data {listejoueurs,nbjoueurs,joueursmax}
    


});



export const Bataille = ()=>{
    return (<jeuBataille/>);
};