// import logo from './logo.svg';
import './App.css';
// import io from 'socket.io-client';
// import { useState } from 'react';
// import md5 from 'md5';
import React from 'react';
// import { useHistory } from 'react-router-dom';
// import {} from Bataille;

import { WavyContainer, WavyLink } from "react-wavy-transitions";

import {Games} from "./Games";
// import {Parties} from "./Parties";
import SocketProvider from './SocketProvider';
import RegisterForm from './RegisterForm';
import RegisterConfirm from './RegisterConfirm';
import LoginForm from './LoginForm';
import ListePartiesBataille from './bataille/ListePartiesBataille';
import ListeParties6quiprend from './6quiprend/ListeParties6quiprend';
import Hamburger from './hamburger';
import ListeSauvegardesPartiesBataille from './bataille/ListeSauvegardesPartiesBataille';
import ListePartiesRejointes from './ListePartiesRejointes';
import ListeSauvegardesParties6quiprend from './6quiprend/ListeSauvegardesParties6quiprend';
// import Chat from './Chat';

import ListePartiesMagic from './shadowhunter/ListePartiesMagic';
import { ChangementUnivers } from './shadowhunter/ChangementUnivers'; 

import CarteJeu from './6quiprend/boeuf';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link,
  // useNavigate
} from "react-router-dom";
import { Bataille } from './bataille/Bataille';
import Leaderboard from './bataille/Leaderboard';
import Leaderboard6 from './6quiprend/Leaderboard6';

import { SixQuiPrend } from './6quiprend/6quiprend';
import ShadowHunter from './shadowhunter/ShadowHunter';


//Defini toutes tes pages ici
function MyApp() {
  return (
    <div>
      {/* <CarteJeu numeroCarte={20}/> */}
      <WavyContainer />
      <Router>
      <Hamburger />
        <Routes>
          <Route path="/" element={<LoginForm />} /> 
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/registerConfirm" element={<RegisterConfirm />} />
          <Route path="/games" element={<SocketProvider><Games/></SocketProvider>} />
          {/* accueil */}
          <Route path="/bataille" element={<SocketProvider><ListePartiesBataille/></SocketProvider>} />
          <Route path="/6quiprend" element={<SocketProvider><ListeParties6quiprend/></SocketProvider>} />
          {/* lobby */}
          <Route path='/batailleJeu'element={<SocketProvider><Bataille/></SocketProvider>}/>
          <Route path="/6quiprendJeu" element={<SocketProvider><SixQuiPrend/></SocketProvider>}/>
          {/*  leaderboard */}
          <Route path='/leaderboardbataille' element={<SocketProvider><Leaderboard typeDeJeu={"Bataille"}/></SocketProvider>}/>
          <Route path='/leaderboard6quiprend' element={<SocketProvider><Leaderboard6 typeDeJeu={"6quiprend"}/></SocketProvider>}/>
          {/* sauvegarde */}
          <Route path="/sauvegardeBataille" element={<SocketProvider><ListeSauvegardesPartiesBataille/></SocketProvider>} />
          <Route path="/sauvegardeSixQuiPrend" element={<SocketProvider><ListeSauvegardesParties6quiprend/></SocketProvider>} />
          <Route path="/ListePartiesRejointes" element={<SocketProvider><ListePartiesRejointes/></SocketProvider>} />
          {/* shadow hunter */}
          <Route path="/changementunivers" element={<SocketProvider><ChangementUnivers/></SocketProvider>} />
          <Route path="/magic" element={<SocketProvider><ListePartiesMagic/></SocketProvider>} />
          <Route path="/shadowhunterjeu" element={<ShadowHunter />} />

          {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
          {/* <Route path="/chat" element={<SocketProvider><Chat/></SocketProvider>} /> */}
        </Routes>
      </Router>
    </div>
  );
};
export default MyApp;