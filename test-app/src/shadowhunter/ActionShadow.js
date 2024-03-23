import "./ShadowHunter.css";
import SocketContext from "../SocketContext";
import React from "react";
import Des from "./Des/Des";


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
                    <Des des1valeur={actV[0]} des2valeur={actV[1]}/>
                </div>
            )
            break;

        case "dégatSubits":
            ActComp = (
                <div>
                  {actV.personnages.map((carte,index)=>(
                    <img key={index} src={"http://localhost:8888/carteShadow/"+carte+".png"} alt= {carte} />
                  ))}
                </div>
            )
            break;

        case "cartePiochée":
            ActComp = (
                <div>
            <img key={actV} class="joliebouton" src={"http://localhost:8888/carteShadow/"+actV+".png"} alt= {actV} />

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
            break
           

        case "carteRévélée":
            ActComp = (
                <div>
                    <img key={actV} src={"http://localhost:8888/carteShadow/" + actV.carteRévélée + ".png"} alt={actV} />

                </div>
            )
        break;

        case "vision": 

            ActComp = (
                <div>
                    { actV.idJoueur == idJoueurLocal ? 
                        <img  src={"http://localhost:8888/carteShadow/" + actV.vision + ".png"} alt={actV} />

                    :<div></div>}
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

