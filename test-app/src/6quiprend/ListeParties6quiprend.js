import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from '../SocketContext';
import Leaderboard from "../bataille/Leaderboard";


function ListeParties6quiprend(){
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [partiesOuvertes, setPartiesOuvertes] = useState([]);
    const [joueursMax, setJoueursMax] = useState(2);
    const [bot1, setbot1] = useState(0);
    const [bot2, setbot2] = useState(0);
    const [maxJoueurs, setMaxJoueurs] = useState(10);
    const [maxBot1, setMaxBot1] = useState(10);
    const [maxBot2, setMaxBot2] = useState(10);

    useEffect(() => {
        socket.emit('demandepartiesouvertes', '6quiprend');
        socket.on('partiesOuvertes', (data) => {
            // console.log('Liste mise à jour : ', data);
            setPartiesOuvertes(data);
        });
    }, [partiesOuvertes]);
    
    const createPartie = () => {
        socket.emit('creerPartie', {"joueursMax":joueursMax, "type":"6quiprend", "bot1":bot1, "bot2":bot2});
        socket.on('creerPartie', (idPartie) => {
            // console.log(idPartie);
            if (idPartie === false) {
              navigate("/");
            }
            else{
              navigate("/6quiprendJeu?idPartie="+idPartie);
            }
        }
        );
    }

    useEffect(() => {
      setMaxJoueurs(Math.max(0, 10 - bot1 - bot2));
      setMaxBot1(Math.max(0, 10 - joueursMax - bot2));
      setMaxBot2(Math.max(0, 10 - joueursMax - bot1));
  }, [joueursMax, bot1, bot2]);

    const rejoindrePartie = (idPartie) => {
        socket.emit('rejoindrePartie', {"idPartie":idPartie, "type":"6quiprend"});
        console.log(idPartie);
        socket.on('rejoindrePartie', (data) => {
            // console.log(data);
            if (data !== false && data === idPartie) {
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
      <button className="joliebouton" onClick={()=>navigate("/leaderboard6quiprend")}>Afficher le classement</button> <br></br> <br></br>
      <div className='joinPartieId'>
        <input  className="input1" type="text" placeholder="Id de la partie" id="idPartie"></input> 
        <button  className="joliebouton" onClick={()=>rejoindrePartie(document.getElementById("idPartie").value)}>Rejoindre !</button> <br></br> <br></br>
      </div>
      <div className="createPartie">
        <input className="input1" type="number" placeholder="Nombre de joueurs" id="joueursMax" onChange={(e)=>setJoueursMax(e.target.value)} max={maxJoueurs} min="0"></input> 
        <br></br> <br></br>
        <input className="input1" type="number" placeholder="Nombre de bots 1" id="bot1" onChange={(e)=>setbot1(e.target.value)} max={maxBot1} min="0"></input> 
        <input className="input1" type="number" placeholder="Nombre de bots 2" id="bot2" onChange={(e)=>setbot2(e.target.value)} max={maxBot2} min="0"></input> 
        <button className="joliebouton" onClick={createPartie}>Créer !</button> <br></br> <br></br>
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
              <button className="joliebouton"onClick={()=>rejoindrePartie(partie.id)}>Rejoindre !</button>
            </div>
          )
        })}
      </div>
      <button className="joliebouton" onClick={()=>navigate("/sauvegardeSixQuiPrend")}>Liste Parties Sauvegardees</button>
      <button className="joliebouton" onClick={()=>navigate("/ListePartiesRejointes")}>Liste Parties Rejointes</button>
      <button className="joliebouton" onClick={()=>navigate("/games")}>Revenir au menu de sélection des jeux</button>
      {/* importer la leaderboard  faut ajouter le css
      <div className='Leaderboard'> 
        <Leaderboard/>
      </div> */}

    </div>
  
    )
  
  }

export default ListeParties6quiprend;