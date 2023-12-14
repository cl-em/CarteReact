import './App.css';
import {idJoueur} from './App.js';
import {io} from "socket.io-client";


import {
    useNavigate
} from "react-router-dom";

const socket = io('http://localhost:8888');

// let IdJoueur;

function P2({nomJ}){
    return (
        <di>
            <p>element</p>
        </di>
    );
}

let listeJoueursP=[];
let hote;
socket.on("infoLobby",data=>{
    //data {listejoueurs,nbjoueurs,joueurs,idHote}
    listeJoueursP=data.listesjoueurs;

    hote = data.host;
});



export function Accueil({liste,css}){
    let listeP = [];
    liste.forEach((element,index)=>{
        listeP.push(<div><p>{element}</p></div>);
    });
    return(
        <div style={{padding:"0",margin:"0"}}>{listeP}</div>
    )
}


socket.emit("infoLobby",{idJoueur:"",idPartie:""}); 

export function Lobby({listesjoueurs,nbjoueurs,joueursmax}){
    // listesjoueurs : liste de string,

    return (<div><p>{nbjoueurs}/{joueursmax}</p></div>)
}



export const Bataille = ()=>{
    return (<jeuBataille/>);
};