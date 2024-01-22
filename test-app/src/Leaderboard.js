import axios from "axios";
import SocketContext from './SocketContext';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

function Leaderboard(){
    const navigate = useNavigate();
    const socket = React.useContext(SocketContext);
    useEffect(()=>{
        socket.emit("leaderboard","Bataille");
    },[]);

    const [leaderboardData, setLeaderboardData] = useState(null);

    useEffect(() => {
      // Abonnez-vous à l'événement "leaderboard" ici
      ; // Assurez-vous d'avoir une instance socket.io correcte
      socket.on("leaderboard", (data) => {
        setLeaderboardData(data);
      });
  
      // Assurez-vous de vous désabonner lorsque le composant est démonté
      return () => {
        socket.off("leaderboard");
      };
    }, []); // La dépendance vide signifie que cela ne doit s'exécuter qu'une fois au montage
  
    return (
      <div>
        <center><h1 style={{ color: 'aliceblue' }}>Classement de la bataille :</h1></center> <br></br>
        <div className="leaderboard">
          {leaderboardData && (
            <div>
              {leaderboardData.joueursTop.map((player, index) => (
                <div key={index} className="statsjoueur">
                  <div>
                    <strong>Pseudo:</strong> {player.pseudo}
                  </div>
                  <div>
                    <strong>Score Bataille:</strong> {player.scoreBataille}
                  </div>
                  <div>
                    <strong>Classement:</strong> {player.classement}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <br></br>
        <button onClick={()=>navigate("/bataille")}>Revenir à la liste des parties</button>
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

export default Leaderboard;