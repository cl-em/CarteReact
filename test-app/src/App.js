// import logo from './logo.svg';
import './App.css';
// import io from 'socket.io-client';
// import { useState } from 'react';
// import md5 from 'md5';
import React from 'react';
// import { useHistory } from 'react-router-dom';

// import {} from Bataille;

import {Games} from "./Games";
// import {Parties} from "./Parties";
import SocketProvider from './SocketProvider';
import RegisterForm from './RegisterForm';
import RegisterConfirm from './RegisterConfirm';
import LoginForm from './LoginForm';
import ListePartiesBataille from './ListePartiesBataille';
// import Chat from './Chat';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Link,
  // useNavigate
} from "react-router-dom";
import { Bataille } from './Bataille';


//Defini toutes tes pages ici
function MyApp() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} /> 
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/registerConfirm" element={<RegisterConfirm />} />
          <Route path="/games" element={<SocketProvider><Games/></SocketProvider>} />
          <Route path="/bataille" element={<SocketProvider><ListePartiesBataille/></SocketProvider>} />
          <Route path='/batailleJeu'element={<SocketProvider><Bataille/></SocketProvider>}/>
          {/* <Route path="/chat" element={<SocketProvider><Chat/></SocketProvider>} /> */}
        </Routes>
      </Router>
    </div>
  );
};
export default MyApp;