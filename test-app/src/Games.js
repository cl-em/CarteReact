import './App.css';

import {
  useNavigate
} from "react-router-dom";



function MyGame(){
  const navigate = useNavigate();

  return (

    <div className='jeu'>

    <div className='choixJeu1' onClick={()=>navigate("/bataille")}>
    <img src="http://localhost:8888/fichier/dosCarte.png" className='dosChoix'></img>
      <img className='elouand'></img>
      {/* <p>bataille</p> */}
    </div>

    <div className='choixJeu2' onClick={()=>navigate("/6quiprend")}>
    <img src="http://localhost:8888/fichier/dosCarte.png" className='dosChoix'></img>
      <img className='kyky'></img>
    </div>

    {/* <div className='jeu3' onClick={()=>navigate("/poker")}> */}
    {/* </div> */}

    </div>

  )

}

export const Games = ()=>{
  return (<MyGame/>);
};