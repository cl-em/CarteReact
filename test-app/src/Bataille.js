import './App.css';
import {idJoueur} from './App.js';
import {io} from "socket.io-client";

import images from './images';

import {
    useNavigate
} from "react-router-dom";

const socket = io('http://localhost:8888');

// let IdJoueur;



socket.emit("infoLobby",{idJoueur:"",idPartie:""}); 

export function Lobby({listesjoueurs,nbjoueurs,joueursmax}){
    // listesjoueurs : liste de string,

    return (
        
    <div>
        <div className='Table'>
            <div className='j1'>
            </div>
            <div className='j2'>
            </div>    
            <div className='j3'>
            </div>
            <div className='j4'>
            </div>
            <div className='j5'>
            </div>    
            <div className='j6'>
            </div>
            <div className='j7'>
            </div>
            <div className='j8'>
            </div>    
            <div className='j9'>
            </div>   
            <div className='j10'>
            </div> 
        </div>
    </div>
    )
}

socket.on("infoLobby", (data) => { //liste de joueurs (liste de json), taille du paquet, liste de cartes, carte avec valeur et couleur comme attribut
    // data {listejoueurs:tableau,nbjoueurs:int,joueursmax:int}



});



export const Bataille = ()=>{
    return (<jeuBataille/>);
};