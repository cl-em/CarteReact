import React, { createContext, useState, useContext } from 'react';

// Créez un contexte pour l'image survolée
const ImageContext = createContext();

// Fournisseur de contexte pour gérer l'état de l'image survolée
export const ImageProvider = ({ children }) => {
  const [hoveredImageUrl, setHoveredImageUrl] = useState(null);

  const handleHoveredImageChange = (imageUrl) => {
    setHoveredImageUrl(imageUrl);
  };

  return (
    <ImageContext.Provider value={{ hoveredImageUrl, setHoveredImageUrl, handleHoveredImageChange }}>
      {children}
    </ImageContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de l'image
export const useImageContext = () => {
  return useContext(ImageContext);
};
