import React from 'react';
import Boeuf from "./Boeuf.jsx"

const CarteJeu = ({ numeroCarte }) => {
  // Calcul du score en fonction des règles
  let score = 1;
  if (numeroCarte % 11 === 0) {
    score = 5;
    if (numeroCarte % 10 === 5) {
      score = 7;
    }
  } else if (numeroCarte % 10 === 0) {
    score = 3;
  } else if (numeroCarte % 10 === 5) {
    score = 2;
  }

  return (
    <div style={{ position: 'relative', width: '200px', height: '300px', background: 'white' }}>

      <Boeuf width="100%"/>
      <Boeuf width="25%"/>
      

      <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '12px', color:"black" }}>{numeroCarte}</div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '12px', color:"black" }}>{numeroCarte}</div>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '12px', color:"black" }}>{numeroCarte}</div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '12px', color:"black" }}>{numeroCarte}</div>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '48px'}}>{numeroCarte}</div>
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '24px', color:"black" }}>{score}</div>
    </div>
  );
};

export default CarteJeu;
