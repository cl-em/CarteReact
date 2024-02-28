import "./ShadowHunter.css";
import React, { useEffect, useState, useRef} from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import {useNavigate } from "react-router-dom";



function Main({listeDeCarte}){ // liste de string 
    return (
        <div id="main-cartes-sh">
            {listeDeCarte.map((element,index)=>(
                <img key={index} src={"http://localhost:8888/carteShadow/"+element} alt={element}/>
            ))} 
        </div>
    )
}

function Role({nomCarte}){
    
    return (
        <div id="role-carte-sh">
            <img src={"http://localhost:8888/carteShadow/"+nomCarte}  alt={nomCarte} />
            <div>
            <button className="joliebouton2">Révéler</button>
            <button className="joliebouton2">Utiliser sa capacité</button>
            </div>
        </div>
    )
}

function Stats({}){
    return (
        <div id="stats-sh">
            Stats des joueurs (menu défilant)
        </div>
    )
}

function Plateau({ carteEnFonctionDeLaZone }) {
    return (
        <div className="plateau-container">
            <div className="plateau-flex">
                <div className="plateau plateau-gauche">
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Vampire"/>
                    </div>
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Loup-garou"/>
                    </div>
                </div>
                <div className="plateau plateau-droite">
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Sorcier"/>
                    </div>
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Fée"/>
                    </div>
                </div>
            </div>
            <div className="plateau plateau-base">
                <div className="carte">
                    <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Elfe"/>
                </div>
                <div className="carte">
                    <img src="http://localhost:8888/carteShadow/Vampire.avif" alt="Dragon"/>
                </div>
            </div>
        </div>
    );
}

export default function ShadowHunter(){

    //Reset du style du body, on part sur une bonne nouvelle base (c'était plus possible)
    useEffect(() => {
        const Obg = document.body.style.backgroundImage;
        const OHeight = document.body.style.height;
        const OMargin = document.body.style.margin;
        const OPadding = document.body.style.padding;
        const ODisplay = document.body.style.display;
        const OAlign = document.body.style.display;
        const OJustify = document.body.style.display;

        document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table_spooky.avif")`;
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        document.body.style.display = 'block';
        document.body.style.alignItems = 'initial';
        document.body.style.justifyContent = 'initial';

        return () => {
            document.body.style.backgroundImage = Obg;
            document.body.style.height = OHeight;
            document.body.style.margin = OMargin;
            document.body.style.padding = OPadding;

            document.body.style.display = ODisplay;
            document.body.style.alignItems = OAlign;
            document.body.style.justifyContent = OJustify;

        };
        }, []);

    return(
        <>
        <div id="default">
            {/* <Role nomCarte={"Vampire.avif"}/> */}
            <Role nomCarte={"Agnès.avif"}/>
            <Stats />
            <Plateau/>
            <Main listeDeCarte={["Agnès.avif","Allie.avif","Amulette.avif","Broche_De_Chance.avif", "Agnès.avif","Allie.avif","Amulette.avif","Broche_De_Chance.avif", "Agnès.avif","Allie.avif","Amulette.avif","Broche_De_Chance.avif", "Agnès.avif","Allie.avif","Amulette.avif","Broche_De_Chance.avif"]}/>
            <Chat />
        </div>
        </>
    );
};