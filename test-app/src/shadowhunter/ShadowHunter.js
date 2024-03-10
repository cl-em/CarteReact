import "./ShadowHunter.css";
import React, { useEffect, useState, useRef} from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import {useNavigate } from "react-router-dom";
// import Dice from "react-dice-roll";


function Main({listeDeCarte}){ // liste de string 

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="main-cartes-sh">
            {listeDeCarte.map((element,index)=>(
                <img key={index} src={"http://localhost:8888/carteShadow/"+element+".avif"} alt={element}
                onClick={()=>{
                    socket.emit("choixCarte",{idPartie:idPartie,idCarte:element});
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
            <img src={"http://localhost:8888/carteShadow/"+nomCarte+".avif"}  alt={nomCarte} />
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
                        <img src="http://localhost:8888/carteShadow/zone1.avif" alt="Vampire"/>
                    </div>
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/zone2.avif" alt="Loup-garou"/>
                    </div>
                </div>
                <div className="plateau plateau-droite">
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/zone3.avif" alt="Sorcier"/>
                    </div>
                    <div className="carte">
                        <img src="http://localhost:8888/carteShadow/zone4.avif" alt="Fée"/>
                    </div>
                </div>
            </div>
            <div className="plateau plateau-base">
                <div className="carte">
                    <img src="http://localhost:8888/carteShadow/zone5.avif" alt="Elfe"/>
                </div>
                <div className="carte">
                    <img src="http://localhost:8888/carteShadow/zone6.avif" alt="Dragon"/>
                </div>
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
    const [personnage,setPersonnage] = useState("Allie.avif"); 
    const [carteRevele,setCarteRevele] = useState(false);
    const [stuff,setStuff]  = useState(["Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif", "Amulette.avif"]);
    const [pouvoirUtilise,setPouvoirUtilise]  = useState(true);

    // liste de joueurs
    const [listeJoueurs,setListeJoueurs] = useState([]);
    // {pseudo:string,révélé:bool à false si non révélé string sinon,pouvoirUtilisé:bool,dégâts:int}



    useEffect(()=>{

        socket.emit("wantCarte",{ "idPartie": idPartie});

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


    let [message,setMessage] = useState("");
    let [jetsDes,setJetsDes] = useState([0,0]);
    let [joueurConcerne,setJoueurConcerne]= useState("moi");
    let [attaquant,setAttaquant] = useState("moi");
    let [defenseur,setDefenseur] = useState("moi");
    // {pseudo:string,carte:false si pas révélé String sinon,
    // objetsPertinents:array de string}

    let [estRevele,setEstRevele] = useState(false);
    // false : c'est une carte pioché

    useEffect(()=>{
        socket.on("tourPasse",(data)=>{
            let action = data.rapportAction;
            let zozo = action.valeur;
            switch (action.type) {
                case "jetsDeDés":
                    setJetsDes(zozo.valeurs);
                    break;
                case "dégatSubits":
                    setJoueurConcerne(zozo.pseudo);
                    setDegatPris(zozo.dégâts);
                    break;
                case  "cartePiochée":
                    setCarteRevele(zozo);
                    setEstRevele(false);
                    break;
                case "carteRévélée" :
                    setCarteRevele(zozo);
                    setEstRevele(true);
                    break;
                case "attaque":
                    setAttaquant(zozo.attaquant);
                    setDefenseur(zozo.defenseur);
                    break;
                default : 
                    console.log("probleme");
                    break;
            }


        });
    },[]);



    return (
        <div>
            <Role nomCarte={personnage}/>
            <Main listeDeCarte={stuff} />

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
            <Stats />
            <Plateau/>
            <Jouer />
            <Chat />
        </div>
        </>
    );
};