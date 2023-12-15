import './App.css';

import {
  useNavigate
} from "react-router-dom";



function MyGame(){
  const navigate = useNavigate();

  return (

    <div className='jeu'>

    <div className='jeu1' onClick={()=>navigate("/bataille")}>
      <p>Belote</p>
    </div>

    <div className='jeu2' onClick={()=>navigate("/belote")}>
    </div>

    <div className='jeu3' onClick={()=>navigate("/poker")}>
    </div>

    </div>

  )

}

export const Games = ()=>{
  return (<MyGame/>);
};