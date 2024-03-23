import "./ShadowHunter.css";
import SocketContext from "../SocketContext";
import React from "react";


export default function Action({ rapportAction ,idJoueurLocal}) {
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie = urlP.get("idPartie");
    const socket = React.useContext(SocketContext);

    let actV = rapportAction.valeur;
    let ActComp = (<div>default</div>);

    switch (rapportAction.type) {
        case "jetsDeDés":
            ActComp = (
                <div>
                </div>
            )
            break;

        case "dégatSubits":
            ActComp = (
                <div>
                  {actV.pseudo}  a subit {actV.dégâts} dégâts
                  {actV.personnages.map((carte,index)=>(
                    <img key={index} src={"http://localhost:8888/carteShadow/"+carte+"png"} alt= {carte} />
                  ))}
                </div>
            )
            break;

        case "cartePiochée":
            ActComp = (
                <div>
                    Vous devez piocher une carte {actV}
                </div>
            )
            break;

        case "attaque":
            ActComp = (
                <div>
                    Le joueur {actV.attaquant.pseudo} a attaqué {actV.défenseur.pseudo}
                </div>
            )
            break;

        case "choix":
            ActComp = idJoueurLocal==actV.idJoueur ?  (
                <div>
                    {actV.boutons.map((text, index) => (
                      
                        <button key={index} onClick={() => {
                            socket.emit("choixCarte", { idPartie: idPartie, type: "choix", text: text })
                        }}>{text}</button>
                    ))}
                </div>
            ) :<div></div>

        case "carteRévélée" : 
            ActComp = (
                <div>
                    {actV.pseudo} est {actV.carteRévélée}
                </div>
            )

        default:
            ActComp = (
                <div>
                    problème
                </div>
            )

    }

    return ActComp;


}

