import '../App.css';
// import {idJoueur} from './App.js';
// import {io} from "socket.io-client";
import React, { useEffect, useState } from 'react';
import SocketContext from '../SocketContext';
import Chat from '../Chat';
import {
    useNavigate
} from "react-router-dom";

// const socket = io('http://localhost:8888');
// socket.emit("infoLobby",{idJoueur:"",idPartie:""}); 

function Connecte() {
    let urlP = new URL(document.location).searchParams;
    let idPartie = urlP.get("idPartie");
    let socket = React.useContext(SocketContext);

    const [pseudo, setPseudo] = useState("...");

    useEffect(() => {
        socket.emit("quisuisje?");
        socket.on("quisuisje", (data) => {
            console.log("Pseudo reçu :", data.pseudos);
            setPseudo(data);
        })
        return () => {
            socket.off("quisuisje");
        };
    }, [])

    return (
        <div id="sauvegarde-btn" className="quisuisje">
            <p>Connecté en tant que {pseudo}</p>
        </div>
    )
}

export function Lobby({ listesjoueurs, nbjoueurs, joueursmax }) {
    // const socket = React.useContext(SocketContext);
    // listesjoueurs : liste de string,

    function Emplacement(element, a) {
        element.style.left = 50 + 50 * Math.cos(a) + '%';
        element.style.top = 50 + 50 * Math.sin(a) + '%';
    }

    useEffect(() => {
        const pos = document.querySelectorAll('.pos');

        pos.forEach((cercle, index) => {
            let angle = (Math.PI * 2 * index) / pos.length;
            Emplacement(cercle, angle);
        });
    }, [listesjoueurs]); //chaque changement de listesjoueurs


    return (
        <div>
            <div className='Table' id='Table'>
                {listesjoueurs.map((joueur, index) => (
                    <div className='pos' id={joueur} key={joueur}>
                        {joueur}
                    </div>

                ))}
            </div>
        </div>
    );
}

function MainJoueur() {

    const navigate = useNavigate();

    const socket = React.useContext(SocketContext);
    const [listeCartes, setListeCartes] = useState([]);
    // const [listeRecu, setListeRecu] = useState(false);
    // const [listeCartes, setListeCartes] = useState([]);
    const [listeJoueurs, setListeJoueurs] = useState([]);
    const [listeCarteRecu, setListeCarteRecu] = useState(false);
    const [listeJoueursRecu, setListeJoueursRecu] = useState(false);
    const [joueTour, setJoueTour] = useState(false);
    const [host, setHost] = useState(false);


    let urlP = new URL(document.location).searchParams;
    let isEgalite = false;
    let gagnant = false;

    const [gameStart, setGameStart] = useState(false);

    useEffect(() => {
        socket.on("gameStarting", (data) => {
            if (data.idPartie === urlP.get("idPartie")) {
                setGameStart(true);
            }
            socket.emit("isHost", { idPartie: urlP.get("idPartie") });
            socket.on("isHost", (data) => {
                if (data === true) {
                    setHost(true);
                }
            }
            )
        });

        return () => {
            socket.off("gameStarting"); //Pour la mémoire
        };
    }, [urlP.get("idPartie")]);

    useEffect(() => {

        //if(gameStart){
        if (!listeCarteRecu || !listeJoueursRecu || isEgalite || gagnant || gameStart || joueTour) {

            socket.emit("wantCarte", { "idPartie": urlP.get("idPartie") });
            console.log()

            socket.on("getCarte", (data) => {
                setListeCartes(data.main);
                setListeJoueurs(data.infosJoueurs);
                setListeCarteRecu(true);
                setListeJoueursRecu(true);
                setJoueTour(false);
            });

            return () => {
                socket.off("getCarte");
            }
        }

    });

    const CheminImage = (carte) => {
        const { valeur, couleur } = carte;
        const nomImage = `${valeur}_${couleur}.png`;
        return `http://localhost:8888/carte/${nomImage}`;
    };

    function carteJouee(carte) {
        // carte {couleur:string,valeur:string}
        socket.emit("carteJoueeBataille", carte)
        setJoueTour(true);
        // console.log(carte);
        // alert(`${carte.couleur} ${carte.valeur}`);
    }

    let onlyJoueurs = [];
    listeJoueurs.map((element, index) => {
        onlyJoueurs.push(element.pseudo);
    })

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    const TourPasse = (data) => {
        // test si c'est la bonne partie 
        if (urlP.get("idPartie") === data.idPartie) {
            // tout ça se passe après que tous les joueurs aient envoyé leur carte que le résultat du tour soit calculé
            // dans le cas où ils n'y a pas de gagnat le tour s'arrête
            if (!data.winner) {
                document.getElementById("gagnant").innerHTML = "Les joueurs n'ont pas pu être départagé";
                setTimeout(() => {
                    document.getElementById("gagnant").innerHTML = "";
                }, 5000);

            }
            else if (data.égalité) {
                // en cas d'égalité
                // les cartes restent affichées
                // et on fait rejouer les joueurs qui sont dans l'égalité
                for (var elouand of data.cartesJouees) {
                    // boucle sur les joueurs 
                    document.getElementById(elouand.pseudo).innerHTML = `<p>${elouand.pseudo}</p>`;
                }

                let tousLesJoueursEgalite = "";
                // liste de textuel des joueurs qui sont dans l'égalité
                data.winner.forEach((joueur, index) => {
                    // recupération des pseudos des joueurs qui ont pratiqué l'égalité constitutionnel du jeu de la bataille ouverte qui est une variante du jeu de la bataille qui je joue avec un paquet de 54 cartes
                    tousLesJoueursEgalite += `${joueur.pseudo} `;
                });
                // affichage des noms des joueurs qui doivent reposer une carte du paquet de 54 cartes pendant cinq secondes 
                document.getElementById("gagnant").innerHTML += `<p> ÉGALITÉE \n${tousLesJoueursEgalite} doivent rejouer`;
                setTimeout(() => {
                    document.getElementById("gagnant").innerHTML = ""

                }, 5000);

            } else {
                // cas où il n'y a pas d'égalité
                for (var player of data.cartesJouees) {
                    document.getElementById(player.pseudo).innerHTML = `<p>${player.pseudo}</p>`;
                    if (player.choix != null) {
                        document.getElementById(player.pseudo).innerHTML += (`<img class='hop' src="http://localhost:8888/carte/` + player.choix.valeur + `_` + player.choix.couleur + `.png" />`);
                    }
                    gagnant = data.winner;

                }
                document.getElementById("gagnant").innerHTML += `<p>Le gagnant est ${gagnant}</p>`;
                setTimeout(() => {
                    document.getElementById("gagnant").innerHTML = "";
                    //elouand c'est les joueurs
                    for (var elouand of data.cartesJouees) {
                        // boucle sur les joueurs 
                        document.getElementById(elouand.pseudo).innerHTML = `<p>${elouand.pseudo}</p>`
                    }
                }, 5000);

            }

            setListeCarteRecu(false);


            isEgalite = data.egalite;
        }
    };

    useEffect(() => {
        //if (gameStart) {
        socket.on("tourPasse", TourPasse);
        return () => {
            socket.off("tourPasse", TourPasse);
        };
        //}
    }, [/*gameStart*/]);

    useEffect(() => {
        socket.on("carteJouee", (data) => {//Affichage de la carte qui est entrain d'être jouée SI ET SEULEMENT SI ON PEUT LA JOUER
            if (data === false) { return }
            //Sinon c'est comme une carte, il y a data.choix et data.valeur et data.pseudo -Elouand & kyky (merci a lui pour les use effect)
            // unsigned clement
            document.getElementById(data.pseudo).innerHTML = `<p>${data.pseudo}</p>`
            document.getElementById(data.pseudo).innerHTML += `<img class='hop' src=http://localhost:8888/carte/` + data.valeur + `_` + data.couleur + `.png/>`

        });
    }, []);


    useEffect(() => {
        socket.on("partieFinie", (data) => {
            document.getElementById("gagnant").innerHTML = `Le gagnant de la partie est ${data.gagnant}`;


            setTimeout(() => {//On laisse le temps au joueur de comprendre, puis on retourne à la page de sélection des parties
                navigate("/bataille");
            }, 7000);
            //
        });
    }, []);

    useEffect(() => {
        socket.on("partieSauvegardee", (data) => {
            console.log(data);
            if (data.idPartie == urlP.get("idPartie")) {
                navigate("/bataille"); // regler
            }
        });
    }, [socket, urlP]);

    // const emitQuitte = () => {
    //     socket.emit("joueurQuitte", {"idPartie":urlP.get("idPartie")});
    // }

    // useEffect(()=>{
    //     window.addEventListener('beforeunload', emitQuitte); //si abandon volontaire ou involontaire
    // }, []);

    function sauvegarderPartie() {
        // console.log("coucou")
        socket.emit("sauvegarderPartieBataille", { "idPartie": urlP.get("idPartie") })
        navigate("/bataille")
    }

    return (
        <div>
            {host && (
                <button id="sauvegarde-btn" className='joliebouton' onClick={() => sauvegarderPartie()}>Sauvegarder la partie</button>
            )}
            <Chat />
            <Lobby listesjoueurs={onlyJoueurs} />
            <div className='divCartes'>
                {listeCartes.map((carte, index) => (
                    <img key={index} id={index + 1}
                        src={CheminImage(carte)}
                        alt={`Carte ${carte.valeur} ${carte.couleur}`}
                        onClick={() => carteJouee({ "idPartie": urlP.get("idPartie"), "choix": { couleur: carte.couleur, valeur: carte.valeur } })}
                    />
                ))}
            </div>
        </div>
    );


    //     return (
    //         <div>
    //             {gameStart ? (
    //                 <div>
    //                     <Lobby listesjoueurs={onlyJoueurs} />
    //                     <div className='divCartes'>
    //                         {listeCartes.map((carte, index) => (
    //                             <img key={index} id={index + 1}
    //                                 src={CheminImage(carte)}
    //                                 alt={`Carte ${carte.valeur} ${carte.couleur}`}
    //                                 onClick={() => carteJouee({"idJoueur": idJoueur,"idPartie": urlP.get("idPartie"),"choix": { couleur: carte.couleur, valeur: carte.valeur }
    //                                 })}
    //                             />
    //                         ))}
    //                     </div>
    //                 </div>
    //             ) : (
    //                 <AvantPartie />
    //             )}
    //         </div>
    //     );
}

// function AvantPartie() {
//     return (
//         <div>
//             <p>La partie n'a pas encore démarré.</p>
//         </div>
//     );
// }

//<Lobby listesjoueurs={playersList} nbjoueurs={playersList.length} joueursmax={10} />
// socket.emit("infosLobby",data.)

export const Bataille = () => {
    return (
        <div>
            <Connecte />
            <div id='gagnant'>

            </div>
            {/* <Lobby listesjoueurs={playersList} nbjoueurs={playersList.length} joueursmax={10} /> */}
            <MainJoueur />
        </div>
    );
};
