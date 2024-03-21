/*----------------------------------------------Import-----------------------------------------------------*/

import "./ShadowHunter.css";
import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import { useNavigate } from "react-router-dom";
import { createPortal } from 'react-dom';
// import Dice from "react-dice-roll";
import Action from "./ActionShadow";

/*----------------------------------------------Avant jeu + Apres jeu-----------------------------------------------------*/

function AvantJeu() {
    return (
        <div>
            <h3 style={{ color: 'aliceblue' }}>En attente des joueurs</h3>
        </div>
    )
}

function ApresJeu({ tableauFin }) {
}

/*----------------------------------------------Main-----------------------------------------------------*/

function Main({ listeDeCarte }) { // liste de string 

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="main-cartes-sh">
            <div>Vos items :</div> <br></br>
            {listeDeCarte.map((element, index) => (
                <img key={index} src={"http://localhost:8888/carteShadow/" + element + ".png"} alt={element}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, idCarte: element, type: "itemlocalw" });

                    }}
                />
            ))}
        </div>
    )
}

/*----------------------------------------------Role-----------------------------------------------------*/

function Role({ nomCarte }) {
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);


    const imageSrc = `http://localhost:8888/carteShadow/${nomCarte}.avif`;
    return (
        <div id="role-carte-sh">
            Votre rôle (gardez-le secret) :
            <img src={"http://localhost:8888/carteShadow/" + nomCarte + ".png"} alt={nomCarte} />
            <div>
                <button className="joliebouton2"
                    onClick={() => {
                        socket.emit("reveleCarte", { "idPartie": idPartie, "capacite": nomCarte });
                    }}

                >Révéler</button>
                <button className="joliebouton2"
                    onClick={() => {
                        socket.emit("utiliseCapacite", { idPartie: idPartie, capacite: nomCarte });
                    }}
                >Utiliser sa capacité</button>
            </div>
        </div>
    )
}

/*----------------------------------------------Stats-----------------------------------------------------*/

function Stats({ listeJoueurs }) {

    console.log(listeJoueurs)

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="stats-sh">
            {/* <div id="Joueurs">
                <div id="Joueurs-display">
                    <div id="Joueurs-name">
                        <p>Kyky</p>
                    </div>
                    <div id="Joueurs-carte">
                        <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} /> <br></br> <br></br>
                    </div>
                    <div style={{ color: "red" }}>
                        Le joueur ne s'est pas encore révelé
                    </div>
                </div>
                Le joueur a pris 8 degâts.
                <br></br>
                <br></br>
                <div id="stuff">
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                    <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"} />
                </div>
            </div> */}


            {listeJoueurs.map((joueur, index) => {
                <div id="Joueurs">
                    <div id="Joueurs-display">
                        <div id="Joueurs-name">
                            {joueur.pseudo}
                        </div>
                        <div id="Joueurs-carte">
                            {/* state de dos (defaut) si le gars se revele  on met l'image du mec */} <br></br> <br></br>

                        </div>
                        <div id="Joueurs-revele">
                            Le joueurs ne s'est pas révélé
                        </div>
                    </div>
                    Le joueur a pris x degâts
                    <br></br> <br></br>
                    <div id="stuff">
                        {joueur.map((carte, index) => (
                            <img key={index} src={"http://localhost:8888/carteShadow2/" + carte + ".png"} alt={carte}
                                onClick={() => {
                                    socket.emit("choixCarte", { idPartie: idPartie, type: "stuffOther", carte: carte });
                                }}
                            />
                        ))}
                    </div>
                </div>
            })}
        </div >
    )
}

/*----------------------------------------------Plateau-----------------------------------------------------*/

function CartePlateau({ deuxCarte, position }) { //deuxCarte : list 2 element 
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    return (
        <div className={"plateau plateau-" + position}>
            {deuxCarte.map((carte, index) => (
                <div className="carte" key={index}>
                    <img src={"http://localhost:8888/carteShadow/" + carte + ".png"} alt={carte}
                        onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "zone", carte: carte });
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
            <div>Plateau de jeu :</div>
            <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(0, 3)} position={"droite"} />
            <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(3)} position={"base"} />
        </div>
    );
}

/*----------------------------------------------Pioches-----------------------------------------------------*/

function Pioches() {
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    return (
        <div id="pioches">
            <div>Pioches :</div> <br></br>
            <div>
                <img src={"http://localhost:8888/carteShadow2/Carte_Lumiere.png"}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, type: "pioche", carte: "Lumiere" });
                    }}

                />
                <img src={"http://localhost:8888/carteShadow2/Carte_Tenebres.png"}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, type: "pioche", carte: "Tenebres" });
                    }}
                />
                <img src={"http://localhost:8888/carteShadow2/Carte_Vision.png"}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, type: "pioche", carte: "Vision" });
                    }}
                />
            </div>
        </div>
    )
}

/*----------------------------------------------Jouer (appel de tout les autres composants)-----------------------------------------------------*/

function Jouer() {

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    //joueurCourant:
    const [degatPris, setDegatPris] = useState(0);
    const [personnage, setPersonnage] = useState("Allie");
    const [carteRevele, setCarteRevele] = useState(false);
    const [stuff, setStuff] = useState(["Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette", "Amulette"]);
    const [pouvoirUtilise, setPouvoirUtilise] = useState(true);
    const [gameStart, setgameStart] = useState(false);
    const [gameFinish, setFinish] = useState(false);

    // liste de joueurs
    const [listeJoueurs, setListeJoueurs] = useState([]);
    const [zoneDeJeu, setZoneDeJeu] = useState(["Zone1", "Zone2", "Zone3", "Zone4", "Zone5", "Zone6"]);
    // {pseudo:string,révélé:bool à false si non révélé string sinon,pouvoirUtilisé:bool,dégâts:int}

    useEffect(() => {
        socket.on("gameStarting", (data) => {
            if (data.idPartie === idPartie) {
                setgameStart(true);
                socket.emit("wantCarte", { idPartie: idPartie });

                setZoneDeJeu(data.zones);
            }

        })
    }, [])


    useEffect(() => {
        socket.on("getCarte", (data) => {
            let courant = data.joueurCourant;
            setDegatPris(courant.dégats); // int 
            setPersonnage(courant.personnage); // String
            setCarteRevele(courant.révélé); // bool

            setStuff(courant.stuff); //liste de String 
            setPouvoirUtilise(courant.pouvoirUtilisé);//bool

            setListeJoueurs(data.joueurs);
        });
    }, []);

    // info des tours
    let [message, setMessage] = useState("");
    let [jetsDes, setJetsDes] = useState([0, 0]);
    let [joueurConcerne, setJoueurConcerne] = useState("moi");
    let [attaquant, setAttaquant] = useState("moi");
    let [defenseur, setDefenseur] = useState("moi");
    // {pseudo:string,carte:false si pas révélé String sinon,
    // objetsPertinents:array de string}


    let [faireChoix, setFaireChoix] = useState()

    let [estRevele, setEstRevele] = useState(false);
    // false : c'est une carte pioché

    const [action, setAction] = useState({});

    useEffect(() => {
        socket.on("tourPasse", (data) => {
            console.log("tourpasse reçu")
            console.log(data)
            if (data.idPartie == idPartie) {
                setMessage(data.Message);
                setAction(data.rapportAction);

            }


        });
    }, []);



    return (
        <div>
            {/* {gameStart ?  */}
            <div>
                <Chat />
                <Role nomCarte={personnage} />
                <Main listeDeCarte={stuff} />
                <Plateau carteEnFonctionDeLaZone={zoneDeJeu} />
                <Action rapportAction={action} />
                <Stats listeJoueurs={listeJoueurs} />
                <Pioches />

            </div>
            {/* : <AvantJeu/>} */}
        </div>
    )
}

/*----------------------------------------------Default-----------------------------------------------------*/

export default function ShadowHunter() {

    useEffect(() => {
        const Obg = document.body.style.backgroundImage;

        document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table_spooky.png")`;

        return () => {
            document.body.style.backgroundImage = Obg;

        };
    }, []);

    return (
        <div id="default">
            <Jouer />
        </div>
    );
};