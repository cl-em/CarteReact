import './App.css';
import {idJoueur} from './App.js';
import {io} from "socket.io-client";
import React, { useEffect, useState } from 'react';


import {
    useNavigate
} from "react-router-dom";

const socket = io('http://localhost:8888');

// let IdJoueur;



socket.emit("infoLobby",{idJoueur:"",idPartie:""}); 

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

function MainJoueur({listeCartes}){
    
    const CheminImage = (carte) => {
        const { valeur, couleur } = carte;
        const nomImage = `${valeur}_${couleur}.png`;    
        return `http://localhost:8888/carte/${nomImage}`; //foutre chemin des cartes
    };
    
    return (
        <div className='divCartes'>
            {listeCartes.map((carte, index) => (
            <img key={index} id={index + 1} src={CheminImage(carte)} alt={`Carte ${carte.valeur} ${carte.couleur}`} />
            ))}
        </div>
    );
}

//a mettre dans export const bataille pour récupérer la liste des joueurs



//<Lobby listesjoueurs={playersList} nbjoueurs={playersList.length} joueursmax={10} />
let listeCartes;
let listeJoueurs;
let infosJoueurs;
let urlP = new URL(document.location).searchParams;

export const Bataille = () => {
    //const playersList = ['Player1', 'Player2', 'Player3', 'Player4', 'Player5', 'Player6', 'Player7', 'Player8', 'Player 9', 'Player10'];
    socket.emit("infosLobby", {idPartie:urlP.get("idPartie")});

    socket.on("infosLobby", (data) => { //liste de joueurs (liste de json), taille du paquet, liste de cartes, carte avec valeur et couleur comme attribut
    // data {listejoueurs:tableau,nbjoueurs:int,joueursmax:int}
        listeJoueurs = data.listesjoueurs;
        // console.log(listeJoueurs);
    });

    socket.emit("wantCarte",idJoueur);

    //console.log(urlP.get("idPartie"));


    socket.emit("wantCarte",{"idPartie":urlP.get("idPartie"),"idJoueur":idJoueur});

        socket.on("getCarte",(data)=>{
            listeCartes = data.main;
            infosJoueurs = data.infosJoueurs;
        });


    listeCartes = [{valeur: '1', couleur: 'coeur' },{ valeur: '2', couleur: 'trefle' }];

    return ( 
        <div>
            {/* <Lobby listesjoueurs={listeJoueurs} nbjoueurs={9} joueursmax={10} /> */}
            <MainJoueur listeCartes={listeCartes} />
        </div>
    );
};