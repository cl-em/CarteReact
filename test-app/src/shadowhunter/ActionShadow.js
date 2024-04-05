import "./ShadowHunter.css";
import SocketContext from "../SocketContext";
import React from "react";
import Des from "./Des/Des";

import { useImageContext } from "./ImageContext";


export default function Action({ rapportAction, idJoueurLocal }) {
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    const socket = React.useContext(SocketContext);

    const { handleHoveredImageChange } = useImageContext();

    let actV = rapportAction.valeur;
    let ActComp = (<div>default</div>);
    //console.log(rapportAction)
    //console.log(actV);


    switch (rapportAction.type) {
        case "jetsDeDés":
            //console.log("lancer de dés" + actV)
            ActComp = (
                <div id="tourPasse">
                    <Des des1valeur={actV[0]} des2valeur={actV[1]} />
                </div>
            )
            break;

        case "dégatSubits":
            ActComp = (
                <div className="carte1" id="tourPasse">
                    {actV.personnages.map((carte, index) => (
                        <img key={index} src={"http://localhost:8888/carteShadow/" + carte + ".png"} alt={carte} 
                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+carte+".png")}
                        />
                    ))}
                </div>
            )
            break;

        case "cartePiochée":
            ActComp = (
                <div className="carte1" id="tourPasse">
                    <img key={actV} src={"http://localhost:8888/carteShadow/" + actV + ".png"} alt={actV} 
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+actV+".png")}
                    />


                </div>
            )
            break;

        case "attaque":
            ActComp = (
                <div className="carte1" id="tourPasse">
                    {/* <img key={actV} src={"http://localhost:8888/carteShadow/"+(actV[0]==false?"Personnage":actV[0])+".png"} alt= {actV} />
                    <img key={actV} src={"http://localhost:8888/carteShadow/"+(actV[1]==false?"Personnage":actV[1])+".png"} alt= {actV} /> */}

                </div>
            )
            break;

        case "choix":

            ActComp = idJoueurLocal == actV.idJoueur ? (
                <div className="carte1" id="tourPasse">
                    {actV.boutons.map((text, index) => (

                        <button className="joliebouton2" key={index} onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "choix", text: text })
                        }}>{text}</button>
                    ))}
                </div>
            ) : 
            actV.défaut==false||actV.défaut==undefined?<div></div>:<div>
                   <div className="carte1" id="tourPasse">
                <img src={"http://localhost:8888/carteShadow/"+actV.défaut+".png"} alt={actV.défaut}
                onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+actV.défaut+".png")}
                />
                </div>
            </div>
            break


        case "carteRévélée":
            ActComp = (


                <div className="carte1" id="tourPasse">
                    <img key={actV} src={"http://localhost:8888/carteShadow/" + actV.carteRévélée + ".png"} alt={actV.carteRévélée} 
                    onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+actV.carteRévélée+".png")}
                    />
                </div>
            )
            break;

        case "vision1":

            ActComp = (
                <div className="carte1" id="tourPasse">
                    {actV.idJoueur == idJoueurLocal ?
                        <img src={"http://localhost:8888/carteShadow/" + actV.vision + ".png"} alt={actV.vision} 

                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+actV.vision+".png")}
                        />

                        :<img src={"http://localhost:8888/carteShadow/Carte_Vision.png"} alt={actV.vision} 
                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Carte_Vision.png")}
                        />
                    }
                </div>
            );
            break;

            case "vision2":

            ActComp = (
                <div className="carte1" id="tourPasse">
                    {actV.idJoueur == idJoueurLocal ?
                        <div className="carte1" id="tourPasse">
                        <img src={"http://localhost:8888/carteShadow/" + actV.vision + ".png"} alt={actV} 
                        
                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/"+actV.vision+".png")}
                        
                        />
                    {actV.boutons.map((text, index) => (

                        <button className="joliebouton2" key={index} onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "choix", text: text })
                        }}>{text}</button>
                    ))}
                </div>
            

                        :<img src={"http://localhost:8888/carteShadow/Carte_Vision.png"} alt={actV} 

                        onMouseEnter={() => handleHoveredImageChange("http://localhost:8888/carteShadow2/Carte_Vision.png")}
                        />
                    }
                </div>
            )
            break;

        default:
            ActComp = (
                <div>

                </div>
            )

    }
    return ActComp;
}