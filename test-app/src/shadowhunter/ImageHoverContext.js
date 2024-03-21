import React, { createContext, useContext, useState } from 'react';

const ImageHoverContext = createContext();

export const useImageHover = () => useContext(ImageHoverContext);

export const ImageHoverProvider = ({ children }) => {
    const [hoveredImage, setHoveredImage] = useState(null);

    // Mise à jour de l'image survolée seulement si différente de l'actuelle
    const updateHoveredImage = (image) => {
        // Vérifie si l'image actuellement survolée est différente de celle enregistrée
        if (hoveredImage !== image) {
            setHoveredImage(image);
        }
    };

    return (
        <ImageHoverContext.Provider value={{ hoveredImage, updateHoveredImage }}>
            {children}
        </ImageHoverContext.Provider>
    );
};

