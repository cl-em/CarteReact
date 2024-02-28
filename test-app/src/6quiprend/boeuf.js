import React from 'react';
import Boeuf from "./Boeuf.jsx"
import './boeuf.css';

const CarteJeu = ({ numeroCarte }) => {
  // Calcul du score en fonction des règles
  let score = 1;
  let color = "aliceblue";
  if (numeroCarte % 11 === 0) {
    score = 5;
    color = "crimson";
    if (numeroCarte % 10 === 5) {
      score = 7;
      color = "Indigo"
    }
  } else if (numeroCarte % 10 === 0) {
    score = 3;
    color = "greenyellow";
  } else if (numeroCarte % 10 === 5) {
    score = 2;
    color = "darkcyan";
  }
  return (
    
    <div className='carte'>
      <div id='boeuf' style={{backgroundColor:color}}>
        <Boeuf width="100%"/>

      </div>
      <div id='boeufscore'>
        <Boeuf width="70%"/>
      </div>      

      <div id='numcarte1' >{numeroCarte}</div>
      <div id='numcarte2' >{numeroCarte}</div>
      <div id='numcarte3' >{numeroCarte}</div>
      <div id='numcarte4' >{numeroCarte}</div>
      <div id='numcarte5' >{numeroCarte}</div>
      <div id='score' >{score}</div>
      
    </div>
  );
};

export default CarteJeu;
