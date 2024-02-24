// import '../App.css';
import "./ShadowHunter.css";
import React, { useEffect, useState } from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import {
    useNavigate
} from "react-router-dom";



function Main({listeDeCarte}){ // liste de string 

    return (
        <div>
            {listeDeCarte.map((element,index)=>(
                <img key={index} src={"http://localhost:8888/carteShadow/"+element} alt={element}/>
            ))} 
        </div>
    )
}

function Role({nomCarte}){
    return (
        <div id="Role">
            <img src={"http://localhost:8888/carteShadow/"+nomCarte}  alt={nomCarte} />
        </div>
    )
}

function Eric({carteEnFonctionDeLaZone}){
    return(
        <div>
            <div id="gauche" className="zone">
                <Role nomCarte={"Vampire.png"}/>
            </div>
            <div id="droite" className="zone"></div>
            <div id="hypotenuse" className="zone"></div>
        </div>
    )
}




export default function Accueil(){
    return <div >
        {/* <Eric /> */}

        <div id="default">
            <Role nomCarte={"Vampire.png"}/>
            <Main listeDeCarte={["Agnès.png","Allie.png","Amulette.png","Broche_De_Chance.png"]}/>
        </div>
    </div>
}