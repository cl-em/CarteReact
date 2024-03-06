import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import SocketContext from '../SocketContext';


function ListePartiesMagic(){
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [partiesOuvertes, setPartiesOuvertes] = useState([]);
    
    useEffect(() => {
        socket.emit('demandepartiesouvertes', 'Magic');
        socket.on('partiesOuvertes', (data) => {
            setPartiesOuvertes(data);
        });
    }, [partiesOuvertes]);


    useEffect(() => {
      const bg = {
        backgroundImage : document.body.style.backgroundImage
      }

        document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table_spooky.png")`;

        return () => {
          document.body.style.backgroundImage = bg.backgroundImage;
        };

    }, []);

    const [joueursMax, setJoueursMax] = useState(2);
    const createPartie = () => {
        socket.emit('creerPartie', {"joueursMax":joueursMax, "type":"Magic"});
        socket.on('creerPartie', (idPartie) => {
            console.log(idPartie);
            if (idPartie === false) {
              navigate("/");
            }
            else{
              navigate("/shadhowhunterjeu?idPartie="+idPartie);
            }
        }
        );
    }
    const rejoindrePartie = (idPartie) => {
        socket.emit('rejoindrePartie', {"idPartie":idPartie, "type":"shadowHunter"});
        console.log(idPartie);
        socket.on('rejoindrePartie', (data) => {
            console.log(data);
            if (data !== false && data === idPartie) {
                navigate("/shadowhunterjeu?idPartie="+idPartie);
            }
            else{
              const message = "La partie est pleine ou n'existe pas !";
            }
        }
        );
    }
    return (
    <div className='main'>
      <button className="joliebouton2" onClick={()=>navigate("/leaderboardMagic")}>Afficher le leaderboard</button> <br></br> <br></br>
      <div className='joinPartieId'>
        <input  className="input1" type="text" placeholder="Id de la partie" id="idPartie"></input> 
        <button  className="joliebouton2" onClick={()=>rejoindrePartie(document.getElementById("idPartie").value)}>Rejoindre !</button> <br></br> <br></br>
      </div>
      <div className="createPartie">
        <input className="input1" type="text" placeholder="Nombre de joueurs max" id="joueursMax" onChange={(e)=>setJoueursMax(e.target.value)}></input> 
        <button className="joliebouton2" onClick={createPartie}>Créer !</button> <br></br> <br></br>
      </div>
    

      {/*  c'est la liste de toutes les partie  */}
      <div className="listeParties">
        {/* input text de l'id de la partie */}
        {partiesOuvertes.map((partie,index)=>{
          return(
            <div className={"test".concat(index%2)} key={index}>
              <p>{partie.id}</p>
              <p>{partie.joueursActuels}/{partie.joueursMax}</p>
              <p>Magic</p>
              {/* <button onClick={()=>navigate("/6quiprend")}>Rejoindre !</bsutton> */}
              <button className="joliebouton2"onClick={()=>rejoindrePartie(partie.id)}>Rejoindre !</button>
            </div>
          )
        })}
      </div>
      <button className="joliebouton2" onClick={()=>navigate("/games")}>Revenir au menu de sélection des jeux</button>
      {/* importer la leaderboard  faut ajouter le css
      <div className='Leaderboard'> 
        <Leaderboard/>
      </div> */}

    </div>
  
    )
  
  }

export default ListePartiesMagic;