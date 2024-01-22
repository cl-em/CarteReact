import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from './SocketContext';
import Leaderboard from "./Leaderboard";


function ListePartiesBataille(){
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [partiesOuvertes, setPartiesOuvertes] = useState([]);
    useEffect(() => {
        socket.emit('demandepartiesouvertes', 'Bataille');
        socket.on('parties ouvertes bataille', (data) => {
            // console.log('Liste mise à jour : ', data);
            setPartiesOuvertes(data);
        });
    }, [partiesOuvertes]);
    const [joueursMax, setJoueursMax] = useState(2);
    const createPartie = () => {
        socket.emit('creer partie bataille', {"joueursMax":joueursMax});
        socket.on('creer partie bataille', (idPartie) => {
            console.log(idPartie);
            if (idPartie == false) {
              navigate("/");
            }
            else{
              navigate("/batailleJeu?idPartie="+idPartie);
            }
        }
        );
    }
    const rejoindrePartie = (idPartie) => {
        socket.emit('rejoindre partie bataille', {"idPartie":idPartie});
        console.log(idPartie);
        socket.on('rejoindre partie bataille', (data) => {
            // console.log(data);
            if (data != false && data == idPartie) {
                navigate("/batailleJeu?idPartie="+idPartie);
            }
            else{
              const message = "La partie est pleine ou n'existe pas !";
            }
        }
        );
    }
    return (
    <div className='main'>
      <button  onClick={()=>navigate("/leaderboardbataille")}>Afficher le leaderboard</button> <br></br> <br></br>
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
              <p>Bataille</p>
              {/* <button onClick={()=>navigate("/bataille")}>Rejoindre !</button> */}
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

export default ListePartiesBataille;