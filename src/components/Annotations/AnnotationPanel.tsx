import React, { useState } from 'react';
import { Annotation } from '@/hooks/useAnnotations';
import { formatDistanceToNow } from 'date-fns';
import useAuthStore from '@/store/authStore';

interface AnnotationPanelProps {
  annotations: Annotation[];
  activeAnnotation: Annotation | null;
  onAnnotationClick: (annotation: Annotation) => void;
  onDeleteAnnotation: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
}

const ANNOTATION_COLORS = [
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
];

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  onDeleteAnnotation,
  onChangeColor,
}) => {
  const { user } = useAuthStore();
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  // Toggle color picker for a specific annotation
  const toggleColorPicker = (id: string) => {
    setColorPickerOpen(colorPickerOpen === id ? null : id);
  };

  // Check if user can delete an annotation (creator or admin)
  const canDeleteAnnotation = (annotation: Annotation) => {
    if (!user) return false;
    return annotation.createdBy.id === user.id || user.role === 'admin';
  };

  if (annotations.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-white shadow-sm">
        <h3 className="text-lg font-medium mb-2">Annotations</h3>
        <p className="text-gray-500 text-sm">No annotations yet. Select text and click "Annotate" to create one.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-2">Annotations ({annotations.length})</h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {annotations.map((annotation) => (
          <div 
            key={annotation.id}
            className={`p-3 rounded-md border ${
              activeAnnotation?.id === annotation.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'
            } transition-colors cursor-pointer relative`}
            onClick={() => onAnnotationClick(annotation)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: annotation.color }}
                />
                <span className="text-sm font-medium">{annotation.createdBy.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(annotation.createdAt, { addSuffix: true })}
              </div>
            </div>
            
            <div className="text-sm mb-2 break-words">
              "{annotation.text}"
            </div>
            
            <div className="flex justify-end space-x-2 text-xs">
              <button
                className="text-gray-500 hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleColorPicker(annotation.id);
                }}
              >
                Change Color
              </button>
              
              {canDeleteAnnotation(annotation) && (
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnnotation(annotation.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            
            {/* Color picker */}
            {colorPickerOpen === annotation.id && (
              <div 
                className="absolute right-0 bottom-8 bg-white shadow-md rounded-md p-2 z-10 border"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex space-x-1">
                  {ANNOTATION_COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onChangeColor(annotation.id, color);
                        setColorPickerOpen(null);
                      }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotationPanel;
