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


const MyGame = ({jeu,event})=>{
    // const navigate = useNavigate();
  
  return (
    <div style={{
      backgroundColor:"blue",
      // height:"300px",
      width: "250px",
      margin :"10px",
      textAlign : "center",
      padding: "250px 0"
    }} onClick={event}>
      <p>{jeu}</p>
    </div>
  )

}

export  const ListRoom = ()=>{
  const parsedUrl = new URL(window.location.href);
  console.log(parsedUrl.searchParams.get("typejeu"));
  return (<p></p>)
}

export const Games = ()=>{
  const navigate = useNavigate();
  let listJeu = ["bataille","belote","uno"];
  let listGames =[];
  listJeu.forEach((element,index)=>{
    listGames.push(<MyGame jeu={element} key={index} event={()=>navigate("/listJeu?typejeu="+element)}></MyGame>)
  });
  return (<div style={{display: "flex"}}>{listGames}</div>);
};