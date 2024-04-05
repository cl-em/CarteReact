/*----------------------------------------------Import-----------------------------------------------------*/

import "./ShadowHunter.css";
import React, { createContext, useEffect, useState, useRef, useContext } from 'react';
import SocketContext from '../SocketContext';
import { useNavigate } from "react-router-dom";
import Action from "./ActionShadow";
import { ImageProvider, useImageContext } from './ImageContext';
import ImageComponent from './ImageComponent';

import { QuittePartie } from "../6quiprend/6quiprend";

/*----------------------------------------------ChatSH (ajout de différents onglets selon rôle a venir..)-----------------------------------------------------*/

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


    const FinMessageRef = useRef(null);

    const scrollChat = () => {
        FinMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollChat();
    }, [messages]);

    return (
        <div className={`container-chat ${accessibilite ? "accessibilite" : ""}`}>
            <ul className="messages">
                {messages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                ))}
                <li ref={FinMessageRef} />
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
    let urlP = new URL(document.location).searchParams;
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    const [joueursIn,setJoueurIn ]= useState(0);
    const [joueursMax,setJoueursMax] = useState(0);

    socket.emit('demandepartiesouvertes', 'shadowHunter');
    
    
    useEffect(()=>{
        socket.on("partiesOuvertes",(data)=>{
            data.map((partie,index)=>{
                if(partie.id == idPartie){
                    setJoueursMax(partie.joueursMax);
                    setJoueurIn(partie.joueursActuels);
                }
            });
        });
    },[])


    return (
        <div>
            <h3 style={{ color: 'aliceblue' }}>En attente des joueurs({joueursIn}/{joueursMax})</h3>
        </div>
    )
}

function ApresJeu({ listeGagnants }) {
    const navigate = useNavigate();

    let messageGagnants;
    if (listeGagnants.length === 1) {
        messageGagnants = `Le gagnant est :`;
    } else {


        messageGagnants = `Les gagnants sont:`;
    }
    //{"pseudo":pseudos[j.idJoueur],"carte":j.character}
    return (
        <div>
            <p class="messageGagnant">{messageGagnants}</p>
            <div className="fin">

                {listeGagnants.map((joueur, index) => (
                    <div className="divGagnant">
                        <p>{joueur.pseudo}</p>
                        <img src={"http://localhost:8888/carteshadow/" + joueur.carte + ".png"} alt={joueur.carte} key={index} />
                    </div>
                ))}
            </div>
            <div className="finBouton">

                <button className="joliebouton2" onClick={() => navigate("/games")}>
                    Revenir à l'écran de sélection des jeux
                </button>
            </div>

        </div >
    );
}


/*----------------------------------------------Connecté-----------------------------------------------------*/

function Connecte() {
    let urlP = new URL(document.location).searchParams;
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    const [pseudo, setPseudo] = useState("...");

    useEffect(() => {
        socket.emit("quisuisje?");
        socket.on("quisuisje", (data) => {
            setPseudo(data);
        })
        return () => {
            socket.off("quisuisje");
        };
    }, [])

    return (
        <div className="quisuisje">
            <p>Connecté en tant que {pseudo}</p>
        </div>
    )
}

/*----------------------------------------------Main-----------------------------------------------------*/

function Main({ listeDeCarte }) { // liste de string 
    const { handleHoveredImageChange } = useImageContext();
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
                <p>Pas d'équipement..</p>
            ) : (
                <p>Vos équipements :</p>
            )}
            <br></br>
            {listeDeCarte.map((element, index) => (
                <img key={index} src={"http://localhost:8888/carteShadow/" + element + ".png"} alt={element}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, idCarte: element, type: "stuffSelf" });
                    }}
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow/" + element + ".png")}
                />
            ))}
        </div>
    )
}

/*----------------------------------------------Role-----------------------------------------------------*/

function Role({ nomCarte }) {
    const { handleHoveredImageChange } = useImageContext();
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);


    const imageSrc = `http://localhost:8888/carteShadow/${nomCarte}.png`;
    return (
        <div id="role-carte-sh">
            <img src={imageSrc} alt={nomCarte} onMouseEnter={() => handleHoveredImageChange(imageSrc)} />
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
    const { handleHoveredImageChange } = useImageContext();
    // console.log(listeJoueurs)

    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");

    let socket = React.useContext(SocketContext);

    return (
        <div id="stats-sh">
            {listeJoueurs.map((joueur, index) => (
                <div id="Joueurs" onClick={() => { socket.emit("choixCarte", { idPartie: idPartie, type: "CartePersonnage", carte: "Personnage", joueurConcerne: joueur.pseudo }) }}>
                    <div id="Joueurs-display">
                        <div id="Joueurs-carte">
                            {joueur.révélé ?
                                <img src={"http://localhost:8888/carteShadow2/" + joueur.révélé + ".png"} alt={joueur.révélé}
                                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/" + joueur.révélé + ".png")}
                                /> :
                                <img src={"http://localhost:8888/carteShadow2/Personnage.png"}
                                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Personnage.png")}
                                />
                            } <br></br> <br></br>
                        </div>
                        <div>
                            <div id="Joueurs-name">
                                <p>{joueur.pseudo}</p>
                            </div>
                            <div className="degâts">
                                <p>Degâts : {joueur.dégats}</p>
                            </div>
                            <div id="Joueurs-revele">
                                {joueur.révélé ? <p style={{ color: "green" }}>Révélé</p> : <p style={{ color: "red" }}>Non révélé</p>}
                            </div>
                        </div>
                    </div>
                    <div id="stuff">
                        {joueur.stuff.length > 0 ? (
                            joueur.stuff.map((carte, index) => (
                                <img
                                    src={`http://localhost:8888/carteShadow2/${carte}.png`}
                                    onMouseEnter={() => handleHoveredImageChange(`http://localhost:8888/carteShadow2/${carte}.png`)}
                                    onClick={() => {
                                        socket.emit("choixCarte", { idPartie: idPartie, type: "stuffOther", carte: carte, joueurConcerne: joueur.pseudo });
                                        socket.emit("choixCarte", { idPartie: idPartie, idCarte: carte, type: "stuffSelf" });
                                    }}
                                />
                            ))
                        ) : (
                            <p>{joueur.pseudo} a les poches vides..</p>
                        )}
                    </div>

                </div>
            ))}
        </div >
    )
}

/*----------------------------------------------Plateau-----------------------------------------------------*/

function CartePlateau({ deuxCarte, position, listeJoueurs }) {
    const { handleHoveredImageChange } = useImageContext();
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    useEffect(() => {
        console.log(listeJoueurs)
    }, [])


    const joueursDansCetteZone = (zone) => { //On cherche tout les joueurs qui se trouvent dans la zone en parmètres.
        return listeJoueurs.filter(joueur => "zone" + joueur.position === zone);
    };

    return (
        <div className={"plateau"}>
            {deuxCarte.map((carte, index) => (
                <div className={`carte ${carte}`} key={index}>
                    <img src={"http://localhost:8888/carteShadow/" + carte + ".png"} alt={carte}
                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow/" + carte + ".png")}
                        onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "zone", carte: carte });
                        }}
                    />
                    {joueursDansCetteZone(carte).map((joueur, joueurIndex) => (
                        <div key={joueurIndex} className="joueurPseudo" style={{
                            backgroundColor: "black",
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

            <div className="duo1">
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(0, 2)} position={"droite"} listeJoueurs={listeJoueurs} />
            </div>
            <div className="duo2">
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(2, 4)} position={"droite"} listeJoueurs={listeJoueurs} />
            </div>
            <div className="duo3">
                <CartePlateau deuxCarte={carteEnFonctionDeLaZone.slice(4)} position={"base"} listeJoueurs={listeJoueurs} />
            </div>
        </div>
    );
}

/*----------------------------------------------Pioches-----------------------------------------------------*/

function Pioches() {
    const { handleHoveredImageChange } = useImageContext();
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
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Carte_Lumiere.png")}

                />
                <img src={"http://localhost:8888/carteShadow2/Carte_Tenebres.png"}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, type: "pioche", carte: "Tenebres" });
                    }}
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Carte_Tenebres.png")}
                />
                <img src={"http://localhost:8888/carteShadow2/Carte_Vision.png"}
                    onClick={() => {
                        socket.emit("choixCarte", { idPartie: idPartie, type: "pioche", carte: "Vision" });
                    }}
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Carte_Vision.png")}
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

    const [listeGagnants, setListeGagnants] = useState([]);

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
        socket.on("gameFinished", (data) => {
            if (data.idPartie === idPartie) {
                setFinish(true);

                setListeGagnants(data.gagnants);
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
            {gameStart ? (
                gameFinish ? (
                    <ApresJeu listeGagnants={listeGagnants} />
                ) : (
                    <div>
                        <ImageProvider>
                            <div className="droite">
                                <Connecte />
                                <Stats listeJoueurs={listeJoueurs} />
                            </div>
                            <div className="gauche">
                                <div className="elements-gauche-haut">
                                    <Pioches />
                                    <Main listeDeCarte={stuff} />
                                    <Role nomCarte={personnage} />
                                    <div className="carte-hover">
                                        <ImageComponent />
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <QuittePartie typePartie={"shadowHunter"} className={"joliebouton3"} />
                                    </div>

                                </div>
                            </div>
                            <div className="milieu-sh">
                                <Plateau carteEnFonctionDeLaZone={zoneDeJeu} listeJoueurs={listeJoueurs} />
                            </div>
                            <div className="bas">
                                <div className="messageTourPasse">
                                    {message.length > 0 ? <p>{message}</p> : <div></div>}
                                </div>
                                <Action rapportAction={action} idJoueurLocal={idJoueur} />
                            </div>
                        </ImageProvider>
                    </div>
                )
            ) : <AvantJeu />}
            <ChatSH />
        </div>
    );
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