import axios from "axios";
import SocketContext from '../SocketContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function LeaderboardSH({typeDeJeu}){

    useEffect(() => {

        const obg = document.body.style.backgroundImage;


        document.body.style.backgroundImage = 'url("http://localhost:8888/fichier/table_spooky.png")';


        return () => {

            document.body.style.backgroundImage = obg;
        };
    }, []);
  // le type c'est : Bataille ou 6quiprend ou shadowHunter
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    useEffect(()=>{
        socket.emit("leaderboard",typeDeJeu);
    },[]);

    const [leaderboardData, setLeaderboardData] = useState(null);

    useEffect(() => {

      ;
      socket.on("leaderboard", (data) => {
        setLeaderboardData(data);
      });
  
      return () => {
        socket.off("leaderboard");
      };
    }, []);
  
    return (
      <div>
        <center><h1 style={{ color: 'aliceblue' }}>Classement du Shadow Hunter :</h1></center> <br></br>
        <div className="leaderboard">
          {leaderboardData && (
            <table>
              <thead>
                <tr>
                  <th>Pseudo</th>
                  <th>Score {typeDeJeu}</th>
                  <th>Classement</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.joueursTop.map((player, index) => (
                  <tr key={index}>
                    <td>{player.pseudo}</td>
                    <td>{player["score" + typeDeJeu]}</td>
                    <td>{player.classement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <br></br>
        <button  class="joliebouton2" onClick={()=>navigate("/magic")}>Revenir à la liste des parties</button>
      </div>
    );   
    
/*[
  {
    pseudo: 'elouand',scoreBataille: 10000000000000000,classement: 1},
  { pseudo: 'test3', scoreBataille: 3, classement: 2 },
  { pseudo: 'test', scoreBataille: 0, classement: 3 },
  { pseudo: 'test2', scoreBataille: 0, classement: 4 },
  { pseudo: 'testz', scoreBataille: 0, classement: 5 }
]*/
}

// export default LeaderboardSH;