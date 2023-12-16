import './App.css';
import {idJoueur} from './App.js';
import {io} from "socket.io-client";
import React, { useEffect, useState } from 'react';


import {
    useNavigate
} from "react-router-dom";

const socket = io('http://localhost:8888');

// let IdJoueur;



// socket.emit("infoLobby",{idJoueur:"",idPartie:""}); 

export function Lobby({listesjoueurs, nbjoueurs , joueursmax}) {
    // listesjoueurs : liste de string,
    
    function posCercles(element, theta) {
      element.style.left = 50 + 50 * Math.cos(theta) + '%';
      element.style.top = 50 + 50 * Math.sin(theta) + '%';
    }
    
    useEffect(() => {
        const cercles = document.querySelectorAll('.cercle');
    
        cercles.forEach((cercle, index) => {
        let angle = (Math.PI * 2 * index) / cercles.length;
        posCercles(cercle, angle);
        });
    }, [listesjoueurs]); //chaque changement de listesjoueurs


    return (
        <div>
            <div className='Table'>
                {listesjoueurs.map((joueur, index) => (
                <div className='cercle'>
                    {joueur}
                </div>
        ))}
            </div>
        </div>
        );
    }

function MainJoueur() {
    const [listeCartes, setListeCartes] = useState([]);
    const [listeRecu, setListeRecu] = useState(false);

    // const [listeCartes, setListeCartes] = useState([]);
    const [listeJoueurs, setListeJoueurs] = useState([]);
    const [listeCarteRecu, setListeCarteRecu] = useState(false);
    const [listeJoueursRecu, setListeJoueursRecu] = useState(false);
    let urlP = new URL(document.location).searchParams;

    useEffect(() => {
        if (!listeRecu) {
            socket.emit("wantCarte", { "idPartie": urlP.get("idPartie"), "idJoueur": idJoueur });

            socket.on("getCarte", (data) => {
                setListeCartes(data.main);
                setListeJoueurs(data.infosJoueurs);
                setListeCarteRecu(true);
                setListeJoueursRecu(true);
                // console.log(listeJoueurs);
            });
        }
    });

    const CheminImage = (carte) => {
        const { valeur, couleur } = carte;
        const nomImage = `${valeur}_${couleur}.png`;
        return `http://localhost:8888/carte/${nomImage}`;
    };

    

    function carteJouee(carte){
        // carte {couleur:string,valeur:string}
        socket.emit("carteJouee",carte)
        // console.log(carte);
        // alert(`${carte.couleur} ${carte.valeur}`);
    }

    let onlyJoueurs=[];
    listeJoueurs.map((element,index)=>{
        onlyJoueurs.push(element.pseudo);
    })

    return (
        <div>
            <Lobby  listesjoueurs={onlyJoueurs}/>
            <div className='divCartes'>
                {listeCartes.map((carte, index) => (
                    <img key={index} id={index + 1} 
                        src={CheminImage(carte)} 
                        alt={`Carte ${carte.valeur} ${carte.couleur}`}
                        onClick={()=>carteJouee({"idJoueur":idJoueur,"idPartie":urlP.get("idPartie"),"choix":{couleur:carte.couleur,valeur:carte.valeur}})} 
                    />
                ))}
            </div>
        </div>
    );
}
    

//<Lobby listesjoueurs={playersList} nbjoueurs={playersList.length} joueursmax={10} />

let playersList = ['Player1'];
// socket.emit("infosLobby",data.)



export const Bataille = () => {
    return (
        <div>
            {/* <Lobby listesjoueurs={playersList} nbjoueurs={playersList.length} joueursmax={10} /> */}
            <MainJoueur/>
        </div>
    );
};