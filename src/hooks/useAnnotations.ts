import { useState, useEffect, useCallback } from 'react';
import { useYjsContext } from './useYjsContext';
import { v4 as uuidv4 } from 'uuid';
import useAuthStore from '@/store/authStore';

export interface Annotation {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  color: string;
  createdAt: number;
  createdBy: {
    id: string;
    name: string;
  };
  updatedAt?: number;
}

export const useAnnotations = (_documentId: string) => {
  const yjsContext = useYjsContext();
  const { user } = useAuthStore();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string } | null>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);

  // Initialize annotations from Y.js
  useEffect(() => {
    if (!yjsContext.doc) return;

    // Get or create the annotations map
    const annotationsMap = yjsContext.doc.getMap('annotations');
    
    // Initialize annotations state from Y.js
    const loadAnnotations = () => {
      const loadedAnnotations: Annotation[] = [];
      annotationsMap.forEach((value: unknown, _key: string) => {
        try {
          const annotation = JSON.parse(value as string);
          loadedAnnotations.push(annotation);
        } catch (error) {
          console.error('Error parsing annotation:', error);
        }
      });
      
      // Sort annotations by creation time
      loadedAnnotations.sort((a, b) => a.createdAt - b.createdAt);
      setAnnotations(loadedAnnotations);
    };

    // Load initial annotations
    loadAnnotations();

    // Subscribe to changes
    const handleAnnotationsUpdate = () => {
      loadAnnotations();
    };

    annotationsMap.observe(handleAnnotationsUpdate);

    return () => {
      annotationsMap.unobserve(handleAnnotationsUpdate);
    };
  }, [yjsContext.doc]);

  // Create a new annotation
  const createAnnotation = useCallback((color: string = '#FFEB3B') => {
    if (!yjsContext.doc || !selectedText || !user) return null;
    
    const annotationsMap = yjsContext.doc.getMap('annotations');
    
    const newAnnotation: Annotation = {
      id: uuidv4(),
      startIndex: selectedText.start,
      endIndex: selectedText.end,
      text: selectedText.text,
      color,
      createdAt: Date.now(),
      createdBy: {
        id: user.id,
        name: user.name,
      }
    };
    
    // Store in Y.js
    annotationsMap.set(newAnnotation.id, JSON.stringify(newAnnotation));
    
    // Clear selection
    setSelectedText(null);
    
    return newAnnotation;
  }, [yjsContext.doc, selectedText, user]);

  // Update an existing annotation
  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    if (!yjsContext.doc) return;
    
    const annotationsMap = yjsContext.doc.getMap('annotations');
    const annotationStr = annotationsMap.get(id);
    
    if (!annotationStr) return;
    
    try {
      const annotation = JSON.parse(annotationStr as string);
      const updatedAnnotation = {
        ...annotation,
        ...updates,
        updatedAt: Date.now()
      };
      
      annotationsMap.set(id, JSON.stringify(updatedAnnotation));
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  }, [yjsContext.doc]);

  // Delete an annotation
  const deleteAnnotation = useCallback((id: string) => {
    if (!yjsContext.doc) return;
    
    const annotationsMap = yjsContext.doc.getMap('annotations');
    annotationsMap.delete(id);
    
    if (activeAnnotation?.id === id) {
      setActiveAnnotation(null);
    }
  }, [yjsContext.doc, activeAnnotation]);

  // Handle text selection
  const handleTextSelection = useCallback((start: number, end: number, text: string) => {
    if (start === end) {
      setSelectedText(null);
      return;
    }
    
    setSelectedText({ start, end, text });
  }, []);

  // Find annotations that overlap with a given range
  const findAnnotationsInRange = useCallback((start: number, end: number) => {
    return annotations.filter(
      annotation => 
        (start <= annotation.startIndex && annotation.startIndex <= end) || // Annotation start is within range
        (start <= annotation.endIndex && annotation.endIndex <= end) || // Annotation end is within range
        (annotation.startIndex <= start && end <= annotation.endIndex) // Range is within annotation
    );
  }, [annotations]);

  // Get annotation at a specific index
  const getAnnotationAtIndex = useCallback((index: number) => {
    return annotations.find(
      annotation => annotation.startIndex <= index && index <= annotation.endIndex
    ) || null;
  }, [annotations]);

  // Set the active annotation
  const setAnnotationActive = useCallback((annotation: Annotation | null) => {
    setActiveAnnotation(annotation);
  }, []);

  // Change annotation color
  const changeAnnotationColor = useCallback((id: string, color: string) => {
    updateAnnotation(id, { color });
  }, [updateAnnotation]);

  return {
    annotations,
    selectedText,
    activeAnnotation,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    handleTextSelection,
    findAnnotationsInRange,
    getAnnotationAtIndex,
    setAnnotationActive,
    changeAnnotationColor
  };
};

export default useAnnotations;
