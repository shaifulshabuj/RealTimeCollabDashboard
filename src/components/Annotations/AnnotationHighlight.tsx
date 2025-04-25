import React from 'react';
import { Annotation } from '@/hooks/useAnnotations';

interface AnnotationHighlightProps {
  annotation: Annotation;
  isActive: boolean;
  onClick: (annotation: Annotation) => void;
}

const AnnotationHighlight: React.FC<AnnotationHighlightProps> = ({ 
  annotation, 
  isActive, 
  onClick 
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(annotation);
  };

  return (
    <span
      className={`relative cursor-pointer rounded px-0.5 ${isActive ? 'ring-2 ring-offset-1' : ''}`}
      style={{ 
        backgroundColor: `${annotation.color}80`, // Add transparency
        borderBottom: `2px solid ${annotation.color}`,
      }}
      onClick={handleClick}
      title={`Annotation by ${annotation.createdBy.name}`}
      data-annotation-id={annotation.id}
    >
      {/* Children will be the text content */}
    </span>
  );
};

export default AnnotationHighlight;
