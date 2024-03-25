/*----------------------------------------------Import-----------------------------------------------------*/

import "./ShadowHunter.css";
import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import { useNavigate } from "react-router-dom";
import { createPortal } from 'react-dom';
import Action from "./ActionShadow";
import Des from "./Des/Des";


function ChatSH() {
    const currentUrl = window.location.href;
    const urlParts = currentUrl.split('?idPartie=');
    const idPartie = urlParts[urlParts.length - 1];
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const maxMessages = 50;
    const maxMessageLength = 250;
    const socket = React.useContext(SocketContext);

    useEffect(() => {
        const handleMessage = (msg) => {
            setMessages(prevMessages => {

                const updatedMessages = [...prevMessages, msg];
                if (updatedMessages.length > maxMessages) {
                    return updatedMessages.slice(updatedMessages.length - maxMessages);
                }
                return updatedMessages;
            });
        };

        const handleShadow = (messageShadow) => {
            if (messageShadow.idPartie == idPartie) {
                handleMessage(messageShadow.Message);
            }
        }

        socket.on('message '.concat(idPartie), handleMessage);

        return () => {
            socket.off('message '.concat(idPartie), handleMessage);
        };
    }, [idPartie, socket]);

    const sendMessage = () => {
        if (message.trim() !== '' && message.length <= maxMessageLength) {
            socket.emit('message', { message, idPartie });
            setMessage('');
        }
    };

    const [accessibilite, setAccessibilite] = useState(false);


    return (
        <div className={`container-chat ${accessibilite ? "accessibilite" : ""}`}>
            <ul className="messages">
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
            </ul>

            <div className="input-area2">
                <input className="input1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
                    maxLength={maxMessageLength}
                />
            </div>
        </div>
    );

}

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

    const [hoveredImage, setHoveredImage] = useState(null);
    const handleMouseEnter = (imageId) => {
        setHoveredImage(imageId);
        // console.log(`L'utilisateur survole l'image ${imageId}`);
    };
    // const handleMouseLeave = () => {
    // setHoveredImage(null); // si tu veux que l'image degage
    // console.log(`L'utilisateur a quitté l'image`);
    //   };

    return (
        <div id="main-cartes-sh">
            {listeDeCarte.length === 0 ? (
        <p>Vous n'avez pas encore d'équipements</p>
    ) : (
        <p>Vos équipements :</p>
    )}
            <br></br>
            {listeDeCarte.map((element, index) => (
                <img key={index} src={"http://localhost:8888/carteShadow/" + element + ".png"} alt={element}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, idCarte: element, type: "stuffSelf" });
                    }}
                    onMouseEnter={() => handleMouseEnter(index)}
                    // onMouseLeave={handleMouseLeave}
                    className={hoveredImage === index ? 'hovered' : ''}
                />
            ))}
            <div className="hovered-image">
                {hoveredImage !== null && <img src={"http://localhost:8888/carteShadow/" + listeDeCarte[hoveredImage] + ".png"} alt={listeDeCarte[hoveredImage]}
                // onClick={() => {
                //     socket.emit("choixCarte", { idPartie: idPartie, idCarte: listeDeCarte[hoveredImage], type: "stuffSelf" });
                // }} 
                />}
            </div>
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
            <img src={"http://localhost:8888/carteShadow/" + nomCarte + ".png"} alt={nomCarte} />
            <div className="role-bouton">
                <div>
                    <button className="joliebouton2"
                        onClick={() => {
                            socket.emit("reveleCarte", { "idPartie": idPartie, "capacite": nomCarte });
                        }}


                    >Révéler</button></div>

                <div>
                    <button className="joliebouton2"
                        onClick={() => {
                            socket.emit("utiliseCapacite", { idPartie: idPartie, capacite: nomCarte });
                        }}
                    >Utiliser sa capacité</button></div>
            </div>
        </div>
    )
}

/*----------------------------------------------Stats-----------------------------------------------------*/

function Stats({ listeJoueurs }) {

    // console.log(listeJoueurs)

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="stats-sh">
            {listeJoueurs.map((joueur, index) => (

                <div id="Joueurs">
                    <div id="Joueurs-display">
                        <div id="Joueurs-name">
                            <p>{joueur.pseudo}</p>
                        </div>
                        <div id="Joueurs-carte">
                            {joueur.révélé ?
                                <img src={"http://localhost:8888/carteShadow2/" + joueur.révélé + ".png"} alt={joueur.révélé}
                                    onClick={() => {
                                        socket.emit("choixCarte", { idPartie: idPartie, type: "CartePersonnage", carte: joueur.révélé, joueurConcerne: joueur.pseudo });
                                    }} /> :
                                <img src={"http://localhost:8888/carteShadow2/Personnage.png"}
                                    onClick={() => {
                                        socket.emit("choixCarte", { idPartie: idPartie, type: "CartePersonnage", carte: "Personnage", joueurConcerne: joueur.pseudo });
                                    }} />
                            } <br></br> <br></br>
                        </div>
                        <div id="Joueurs-revele">
                            {joueur.révélé ? <p style={{ color: "green" }}>Le joueur s'est révélé</p> : <p style={{ color: "red" }}>Le joueur ne s'est pas révélé</p>}
                        </div>
                    </div>
                    Le joueur a pris {joueur.dégats} degâts
                    <br></br> <br></br>
                    <div id="stuff">
                        {joueur.stuff.length ?
                            joueur.stuff.map((carte, index) => (
                                <img key={index} src={"http://localhost:8888/carteShadow2/" + carte + ".png"} alt={carte}
                                    onClick={() => {
                                        socket.emit("choixCarte", { idPartie: idPartie, type: "stuffOther", carte: carte, joueurConcerne: joueur.pseudo });
                                    }}
                                />
                            ))
                            : <div></div>
                        }
                    </div>
                </div>
            ))}
        </div >
    )
}

/*----------------------------------------------Plateau-----------------------------------------------------*/

function CartePlateau({ deuxCarte, position, listeJoueurs }) {
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);


    const joueursDansCetteZone = (zone) => { //On cherche tout les joueurs qui se trouvent dans la zone en parmètres.
        return listeJoueurs.filter(joueur => "zone" + joueur.position === zone);
    };

    return (
        <div className={"plateau plateau-" + position}>
            {deuxCarte.map((carte, index) => (
                <div className={`carte ${carte}`} key={index}>
                    <img src={"http://localhost:8888/carteShadow/" + carte + ".png"} alt={carte}
                        onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "zone", carte: carte });
                        }}
                    />
                    {joueursDansCetteZone(carte).map((joueur, joueurIndex) => (
                        <div key={joueurIndex} className="joueurPseudo" style={{
                            bottom: `${10 + joueurIndex * 25}px`, // Evite la superposition des joueurs (c'est sacrément embetant sinon)
                        }}>
                            {joueur.pseudo}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}


function Plateau({ carteEnFonctionDeLaZone, listeJoueurs }) {
    return (
        <div className="plateau-container">

            <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(0, 2)} position={"droite"} listeJoueurs={listeJoueurs} />
            <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(2, 4)} position={"droite"} listeJoueurs={listeJoueurs} />
            <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(4)} position={"base"} listeJoueurs={listeJoueurs} />
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
    const [personnage, setPersonnage] = useState("");
    const [carteRevele, setCarteRevele] = useState(false);
    const [stuff, setStuff] = useState([""]);
    const [pouvoirUtilise, setPouvoirUtilise] = useState(true);
    const [gameStart, setgameStart] = useState(false);
    const [gameFinish, setFinish] = useState(false);
    const [idJoueur, setIdJoueur] = useState("");

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
            setIdJoueur(courant.idJoueur);


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
            socket.emit("wantCarte", { idPartie: idPartie })
            // console.log("tourpasse reçu")
            // console.log(data)
            if (data.idPartie == idPartie) {
                setMessage(data.Message);
                setAction(data.rapportAction);
            }


        });
    }, []);



    return (
        <div>
            {gameStart ?
                <div>
                    <div className="droite">
                        <ChatSH />
                        <Stats listeJoueurs={listeJoueurs} />
                    </div>
                    <div className="gauche">
                        <div class="elements-gauche-haut">
                            <Pioches />
                            <Main listeDeCarte={stuff} />
                            <Role nomCarte={personnage} />
                        </div>
                    </div>
                    <Plateau carteEnFonctionDeLaZone={zoneDeJeu} listeJoueurs={listeJoueurs} />
                    <Action rapportAction={action} idJoueurLocal={idJoueur} />
                    <div className="messageTourPasse">
                        {message.length > 0 ? <p>{message}</p> : <div></div>}
                    </div>


                </div>
                : <AvantJeu />}
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