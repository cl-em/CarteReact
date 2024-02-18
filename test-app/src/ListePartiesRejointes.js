import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from './SocketContext';

function ListePartiesRejointes(){
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [partiesRejointes, setpartiesRejointes] = useState([]);
    useEffect(() => {
        socket.emit('demandepartiesRejointes', 'Bataille');
        socket.on('partiesRejointes', (data) => {
            // console.log('Liste mise à jour : ', data);
            setpartiesRejointes(data);
            // console.log('parties rejointes : ', data);
        });
    }, [partiesRejointes]);
    return (
    <div className='main'>
      <button class="joliebouton" onClick={()=>navigate("/leaderboardbataille")}>Afficher le leaderboard</button> <br></br> <br></br>
      <div className='joinPartieId'>
        <input class="input1" type="text" placeholder="Id de la partie" id="idPartie"></input>
        <button class="joliebouton" onClick={()=>navigate("/batailleJeu?idPartie="+document.getElementById("idPartie").value)}>Rejoindre !</button> <br></br> <br></br>
      </div>

      {/*  c'est la liste de toutes les parties  */}
      <div className="listeParties">
        {/* input text de l'id de la partie */}
        {partiesRejointes.map((partie,index)=>{
          return(
            <div className={"test".concat(index%2)} key={index}>
              <p>{partie.id}</p>
              <p>{partie.joueursActuels}/{partie.joueursMax}</p>
              <p>{partie.type}</p>
              {partie.type === "Bataille" ? (
                <button class="joliebouton" onClick={() => navigate("/batailleJeu?idPartie=" + partie.id)}>Rejoindre !</button>
              ) : partie.type === "6quiprend" ? (
                <button class="joliebouton" onClick={() => navigate("/6quiprendJeu?idPartie=" + partie.id)}>Rejoindre !</button>
              ) : null
              }
              {/* <button class="joliebouton" onClick={()=>navigate("/batailleJeu?idPartie="+partie.id)}>Rejoindre !</button> */}
            </div>
          )
        })}
      </div>
      <button class="joliebouton" onClick={()=>navigate("/sauvegardeBataille")}>Liste Parties Sauvegardees Bataille</button>
      <button class="joliebouton" onClick={()=>navigate("/sauvegardeSixQuiPrend")}>Liste Parties Sauvegardees SixQuiPrend</button>
      <button class="joliebouton" onClick={()=>navigate("/games")}>Revenir au menu de sélection des jeux</button>
      {/* importer la leaderboard  faut ajouter le css
      <div className='Leaderboard'> 
        <Leaderboard/>
      </div> */}

    </div>
  
    )
  
  }

export default ListePartiesRejointes;