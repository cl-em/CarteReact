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

      // Permet d'aller dans localhost/games
      <button onClick={()=>navigate("/games")}>Connect!</button>
    </div>
  );
}

const MyGame = ({jeu})=>{
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundColor:"blue",
      // height:"300px",
      width: "250px",
      margin :"10px",
      textAlign : "center",
      padding: "250px 0"
    }}>
      <p>{jeu}</p>
    </div>
  )

}


function MyApp() {
  return (
    <div>
      // Defini toutes tes pages ici
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={} />
          <Route path="/games" element={<MyGame jeu={"gros zizi"} />} />
        </Routes>
      </Router>
    </div>
  );
};

export default MyApp;