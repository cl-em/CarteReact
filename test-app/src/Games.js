// import logo from './logo.svg';
import './App.css';
// import io from 'socket.io-client';


import {
  // BrowserRouter as Router,
  // Routes,
  // Route,
  // Link,
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

/*
export  const ListRoom = ()=>{
  const parsedUrl = new URL(window.location.href);
  console.log(parsedUrl.searchParams.get("typejeu"));
  return (<p></p>)
}
*/

export const Games = ()=>{
  return (<MyGame/>);
};