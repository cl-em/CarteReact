import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client';


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";


// Connectez-vous au serveur Socket.IO
const socket = io('http://localhost:8888');

socket.emit("salut");
function test(){
  socket.emit("salut");
}

// let but = document.getElementById("but");
// but.addEventListener("click",test);

function LoginForm() {
  // Permet de naviger
  const navigate = useNavigate();

  return (
    <div className="login-form">
      <h2>Login</h2>
      <input type = "text" placeholder="username" id="username"></input><br></br>
      <input type = "password" placeholder="password" id="password"></input>
      <br></br>

      {/* // Permet d'aller dans localhost/games */}
      <button onClick={()=>navigate("/games")}>Connect!</button>
    </div>
  );
}

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

const ListRoom = ()=>{
  const parsedUrl = new URL(window.location.href);
  console.log(parsedUrl.searchParams.get("typejeu"));
  return (<p></p>)
}

const Games = ()=>{
  const navigate = useNavigate();
  let listJeu = ["bataille","belote","uno"];
  let listGames =[];
  listJeu.forEach((element,index)=>{
    listGames.push(<MyGame jeu={element} key={index} event={()=>navigate("/listJeu?typejeu="+element)}></MyGame>)
  });
  return (<div style={{display: "flex"}}>{listGames}</div>);
};

function MyApp() {
  return (
    <div>
      {/* // Defini toutes tes pages ici */}
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} /> 
          {/* <Route path="/register" element={} /> */}
          <Route path="/games" element={<Games/>} />
          <Route path="/listJeu" element={<ListRoom />} />
        </Routes>
      </Router>
    </div>
  );
};

export default MyApp;