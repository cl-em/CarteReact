import "./ShadowHunter.css";
import Dice from "react-dice-roll";
import SocketContext from "../SocketContext";
import React from "react";


export default function Action({rapportAction}){
    let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
    let idPartie =  urlP.get("idPartie");
    const socket = React.useContext(SocketContext);

    let actV = rapportAction.valeur;
    let ActComp = (<div>default</div>);

    switch(rapportAction.type){
        case "jetsDeDés" :
            ActComp = (
                <div>
                    <Dice cheatValue={actV[0]} />
                    <Dice cheatValue={actV[1]} />
                </div>
            )
            break;
        
        case "dégatSubits" :
            ActComp = (
                <div>
                    degats
                </div>
            )
            break;

        case "cartePiochée": 
            ActComp = (
                <div>
                    Pioche un carte batard
                </div>
            )
            break;

        case "attaque" : 
            ActComp = (
                <div>
                    le joueur {actV.attaquant.pseudo} a attaqué {actV.défenseur.pseudo}
                </div>
            )
            break;

        case "choix":
            ActComp = (
                <div>
                    {actV.boutons.map((text,index)=>(
                        <button key={index} onClick={()=>{
                            socket.emit("choixCarte",{idPartie:idPartie,type:"choix",text:text})
                        }}>{text}</button>
                    ))}
                </div>
            )

        default :
            ActComp = (
                <div>
                    
                </div>
            )

    }

    return ActComp;


}

