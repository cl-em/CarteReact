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



export const Bataille = ()=>{
    return (<jeuBataille/>);
};