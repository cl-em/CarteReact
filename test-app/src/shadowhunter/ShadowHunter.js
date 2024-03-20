import "./ShadowHunter.css";
import React, { useEffect, useState, useRef} from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import {useNavigate } from "react-router-dom";
// import Dice from "react-dice-roll";

import Action from "./ActionShadow";


function Main({listeDeCarte}){ // liste de string 

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="main-cartes-sh">
            {listeDeCarte.map((element,index)=>(
                <img key={index} src={"http://localhost:8888/carteShadow/"+element+".png"} alt={element}
                onClick={()=>{
                    socket.emit("choixCarte",{idPartie:idPartie,idCarte:element,type:"itemlocalw"});
                    console.log("choixcarte");
                }}
                />
            ))} 
        </div>
    )
}

function Role({nomCarte}){
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");

    let socket = React.useContext(SocketContext);
    
    return (
        <div id="role-carte-sh">
            <img src={"http://localhost:8888/carteShadow/"+nomCarte+".png"}  alt={nomCarte} />
            <div>
            <button className="joliebouton2"
            onClick={()=>{
                socket.emit("reveleCarte",{"idPartie":idPartie,"capacite":nomCarte});
            }}
            
            >Révéler</button>
            <button className="joliebouton2"
            onClick={()=>{
                socket.emit("utiliseCapacite",{idPartie:idPartie,capacite:nomCarte});
            }}
            >Utiliser sa capacité</button>
            </div>
        </div>
    )
}

function Stats({listeJoueurs}){
    return (
        <div id="stats-sh">
                {listeJoueurs.map((joueur,index)=>{
                    <div key={index}>
                        {joueur.pseudo} 
                        révélé : {joueur.révélé}
                        dégâts  : {joueur.dégâts}
                        pouvoir : {joueur.pouvoirUtilisé}
                        stuff : {joueur.stuff}
                    </div>                
               })}
        </div>
    )
}

function CartePlateau({deuxCarte,position}){ //deuxCarte : list 2 element 
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    return (
        <div className={"plateau plateau-"+position}>
            {deuxCarte.map((carte,index)=>(
                <div className="carte" key={index}>
                    <img src={"http://localhost:8888/carteShadow/"+carte+".png"} alt={carte} 
                    onClick={()=>{
                        socket.emit("choixCarte",{idPartie:idPartie,type:"zone",carte:carte});
                    }}
                    />
                </div>
            ))}
        </div>
    )
}

function Plateau({ carteEnFonctionDeLaZone }) {
    return (
        <div className="plateau-container">
            <div className="plateau-flex">
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(0,2)} position={"gauche"}/>
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(2,4)} position={"droite"}/>
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(4)} position={"base"}/> 

            </div>
        </div>
    );
}

function Jouer(){

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    //joueurCourant:
    const [degatPris,setDegatPris] = useState(0);
    const [personnage,setPersonnage] = useState("Allie"); 
    const [carteRevele,setCarteRevele] = useState(false);
    const [stuff,setStuff]  = useState(["Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette"]);
    const [pouvoirUtilise,setPouvoirUtilise]  = useState(true);

    // liste de joueurs
    const [listeJoueurs,setListeJoueurs] = useState([]);
    const [zoneDeJeu,setZoneDeJeu] = useState(["zone1","zone2","zone3","zone4","zone5","zone6"]);
    // {pseudo:string,révélé:bool à false si non révélé string sinon,pouvoirUtilisé:bool,dégâts:int}

    useEffect(()=>{
        socket.on("gameStarting",(data)=>{
            if(data.idPartie === idPartie){
                socket.emit("wantCarte",{idPartie:idPartie});

                setZoneDeJeu(data.zones);
            }

        })
    },[])


    useEffect(()=>{
        

        socket.on("getCarte",(data)=>{
            let courant = data.joueurCourant;
            setDegatPris(courant.dégaots); // int 
            setPersonnage(courant.personnage); // String
            setCarteRevele(courant.révélé); // bool

            setStuff(courant.stuff); //liste de String 
            setPouvoirUtilise(courant.pouvoirUtilisé);//bool

            setListeJoueurs(data.joueurs);
        });
    },[]);

    // info des tours
    let [message,setMessage] = useState("");
    let [jetsDes,setJetsDes] = useState([0,0]);
    let [joueurConcerne,setJoueurConcerne]= useState("moi");
    let [attaquant,setAttaquant] = useState("moi");
    let [defenseur,setDefenseur] = useState("moi");
    // {pseudo:string,carte:false si pas révélé String sinon,
    // objetsPertinents:array de string}


    let [faireChoix,setFaireChoix] = useState()

    let [estRevele,setEstRevele] = useState(false);
    // false : c'est une carte pioché

    const [action,setAction] = useState({});

    useEffect(()=>{
        socket.on("tourPasse",(data)=>{
            console.log("tourpasse reçu")
            console.log(data)
            if(data.idPartie==idPartie){
                setMessage(data.Message);
                setAction(data.rapportAction);

            }
            

        });
    },[]);

    return (
        <div>
            <Role nomCarte={personnage}/>
            <Main listeDeCarte={stuff} />
            <Plateau carteEnFonctionDeLaZone={zoneDeJeu} />

            <Action rapportAction={action} />

            <Stats listeJoueurs={listeJoueurs}/>

        </div>
    )
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

        document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table_spooky.png")`;
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
        
            <Jouer />
            <Chat />
        </div>
        </>
    );
};