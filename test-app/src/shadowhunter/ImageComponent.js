import React from 'react';
import { useImageContext } from './ImageContext'; // Assurez-vous que le chemin est correct

const ImageComponent = () => {
  const { hoveredImageUrl } = useImageContext();

  return (
    <div className="image-container">
      {/* Afficher l'image survolée si elle est définie */}
      {hoveredImageUrl && <img src={hoveredImageUrl} alt="Image Hovered" />}
    </div>
  );
};

export default ImageComponent;