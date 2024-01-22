import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from './SocketContext';
import Leaderboard from "./Leaderboard";


function ListeParties6quiprend(){
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [partiesOuvertes, setPartiesOuvertes] = useState([]);
    useEffect(() => {
        socket.emit('demandepartiesouvertes', '6quiprend');
        socket.on('partiesOuvertes', (data) => {
            // console.log('Liste mise à jour : ', data);
            setPartiesOuvertes(data);
        });
    }, [partiesOuvertes]);
    const [joueursMax, setJoueursMax] = useState(2);
    const createPartie = () => {
        socket.emit('creerPartie', {"joueursMax":joueursMax, "type":"6quiprend"});
        socket.on('creerPartie', (idPartie) => {
            console.log(idPartie);
            if (idPartie == false) {
              navigate("/");
            }
            else{
              navigate("/6quiprendJeu?idPartie="+idPartie);
            }
        }
        );
    }
    const rejoindrePartie = (idPartie) => {
        socket.emit('rejoindrePartie', {"idPartie":idPartie, "type":"6quiprend"});
        console.log(idPartie);
        socket.on('rejoindrePartie', (data) => {
            // console.log(data);
            if (data != false && data == idPartie) {
                navigate("/6quiprendJeu?idPartie="+idPartie);
            }
            else{
              const message = "La partie est pleine ou n'existe pas !";
            }
        }
        );
    }
    return (
    <div className='main'>
        
      <button  onClick={()=>navigate("/leaderboard6quiprend")}>Afficher le leaderboard</button> <br></br> <br></br>
      <div className='joinPartieId'>
        <input type="text" placeholder="Id de la partie" id="idPartie"></input>
        <button onClick={()=>rejoindrePartie(document.getElementById("idPartie").value)}>Rejoindre !</button>
      </div>
      <div className="createPartie">
        <input type="text" placeholder="Nombre de joueurs max" id="joueursMax" onChange={(e)=>setJoueursMax(e.target.value)}></input>
        <button onClick={createPartie}>Créer !</button>
      </div>
    

      {/*  c'est la liste de toutes les partie  */}
      <div className="listeParties">
        {/* input text de l'id de la partie */}
        {partiesOuvertes.map((partie,index)=>{
          return(
            <div className={"test".concat(index%2)} key={index}>
              <p>{partie.id}</p>
              <p>{partie.joueursActuels}/{partie.joueursMax}</p>
              <p>6quiprend</p>
              {/* <button onClick={()=>navigate("/6quiprend")}>Rejoindre !</button> */}
              <button onClick={()=>rejoindrePartie(partie.id)}>Rejoindre !</button>
            </div>
          )
        })}
      </div>
      {/* importer la leaderboard  faut ajouter le css
      <div className='Leaderboard'> 
        <Leaderboard/>
      </div> */}

    </div>
  
    )
  
  }

export default ListeParties6quiprend;