import React from 'react';
import Boeuf from "./Boeuf.jsx"
import './boeuf.css';

function CarteJeu({ numeroCarte }) {
  const imageUrl = `http://localhost:8888/carte6quiprend/${numeroCarte}.png`;

  return (
    <img src={imageUrl} alt={`Carte numéro ${numeroCarte}`} />
  );
}

export default CarteJeu;
