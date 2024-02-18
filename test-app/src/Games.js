import './App.css';

import {
  useNavigate
} from "react-router-dom";

function MyGame(){
  const navigate = useNavigate();
  document.body.style.backgroundImage = `url("http://localhost:8888/fichier/table.jpg")`;

  return (
    <div className='jeu'>
      <h3 className='headerJeux'>Cliquez sur  un jeu pour commencer !</h3>

    <div className='choixJeu1' onClick={()=>navigate("/bataille")}>
    <img src="http://localhost:8888/fichier/elouand.png" className='règlesBataille'></img>
      <img className='elouand' src="http://localhost:8888/fichier/batailleRègles.png"></img>
      {/* <p>bataille</p> */}
    </div>

    <div className='choixJeu2' onClick={()=>navigate("/6quiprend")}>
    <img src="http://localhost:8888/fichier/Clem.png" className='règlesSixQuiPrend'></img>
      <img className='clem' src="http://localhost:8888/fichier/sixQuiPrendRègles.png"></img>
    </div>

    <div className='choixJeu3'S>
    <img src="http://localhost:8888/fichier/kylian.png" className='règlesMagic'></img>
      <img onClick={()=>navigate("/changementunivers")} className='kyky' src="http://localhost:8888/fichier/spirale.gif"></img>
    </div>

    </div>

  )

}

export const Games = ()=>{
  return (<MyGame/>);
};