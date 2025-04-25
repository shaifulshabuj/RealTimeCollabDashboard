import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { createEditor, Descendant, Editor, Transforms, Text as SlateText, BaseEditor, Element } from 'slate';
import { Slate, Editable, withReact, RenderElementProps, RenderLeafProps, ReactEditor } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
import * as Y from 'yjs';
import { withYjs, YjsEditor, slateNodesToInsertDelta } from '@slate-yjs/core';
import { useYjsContext } from '@/hooks/useYjsContext';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import useUndoRedo from '@/hooks/useUndoRedo';
import { usePresenceAwareness } from '@/hooks/usePresenceAwareness';
import useAuthStore from '@/store/authStore';

// Define custom element types
type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type HeadingOneElement = {
  type: 'heading-one';
  children: CustomText[];
};

type HeadingTwoElement = {
  type: 'heading-two';
  children: CustomText[];
};

type BulletedListElement = {
  type: 'bulleted-list';
  children: CustomText[];
};

type NumberedListElement = {
  type: 'numbered-list';
  children: CustomText[];
};

type ListItemElement = {
  type: 'list-item';
  children: CustomText[];
};

type CustomElement = ParagraphElement | HeadingOneElement | HeadingTwoElement | BulletedListElement | NumberedListElement | ListItemElement;

// Define custom text types
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

// Extend the Slate types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Initial value for the editor
const initialValue: ParagraphElement[] = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is a collaborative rich text editor. Start typing to see real-time collaboration in action!' },
    ],
  },
];

interface CollaborativeEditorProps {
  documentId: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ documentId }) => {
  // Get the Yjs context
  const yjsContext = useYjsContext();
  
  // Use WebSocket sync for real-time collaboration
  const { isConnected, isInRoom } = useWebSocketSync(documentId);
  
  // Use undo/redo functionality
  const { undo, redo, canUndo, canRedo } = useUndoRedo(documentId);
  
  // Use presence awareness for cursor tracking
  const { activeUsers, updateCursor, updateSelection } = usePresenceAwareness(documentId);
  
  // Get current user
  const { user: _user } = useAuthStore();
  
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => {
    // Create the base editor with React and history plugins
    const slateEditor = withHistory(withReact(createEditor()));
    
    // If we have a Yjs document, enhance the editor with Yjs
    if (yjsContext.doc) {
      // Get or create a Yjs text type for the editor content
      const sharedType = yjsContext.doc.get('content', Y.XmlText) as Y.XmlText;
      
      // Create a Yjs-enabled editor
      return withYjs(slateEditor, sharedType);
    }
    
    return slateEditor;
  }, [yjsContext.doc]);
  
  // Track editor value state
  const [value, setValue] = useState<Descendant[]>(initialValue);
  
  // Initialize editor with content from Yjs
  useEffect(() => {
    if (yjsContext.doc && YjsEditor.isYjsEditor(editor)) {
      // Get the shared type
      const sharedType = yjsContext.doc.get('content', Y.XmlText) as Y.XmlText;
      
      // If the shared type is empty, initialize it with our initial value
      if (sharedType.toString() === '') {
        const delta = slateNodesToInsertDelta(initialValue);
        sharedType.applyDelta(delta);
      }
    }
  }, [editor, yjsContext.doc]);
  
  // Render a Slate element
  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    
    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes} className="text-2xl font-bold mb-2">{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes} className="text-xl font-bold mb-2">{children}</h2>;
      case 'bulleted-list':
        return <ul {...attributes} className="list-disc ml-5 mb-2">{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes} className="list-decimal ml-5 mb-2">{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return <p {...attributes} className="mb-3">{children}</p>;
    }
  }, []);
  
  // Render a Slate leaf
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    let formattedChildren = children;
    
    if ((leaf as CustomText).bold) {
      formattedChildren = <strong>{formattedChildren}</strong>;
    }
    
    if ((leaf as CustomText).italic) {
      formattedChildren = <em>{formattedChildren}</em>;
    }
    
    if ((leaf as CustomText).underline) {
      formattedChildren = <u>{formattedChildren}</u>;
    }
    
    if ((leaf as CustomText).code) {
      formattedChildren = <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{formattedChildren}</code>;
    }
    
    return <span {...attributes}>{formattedChildren}</span>;
  }, []);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Check for Ctrl+B (Bold)
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      const [match] = Editor.nodes(editor, {
        match: n => SlateText.isText(n) && (n as CustomText).bold === true,
        universal: true,
      });
      
      Transforms.setNodes(
        editor,
        { bold: match ? false : true } as Partial<CustomText>,
        { match: n => SlateText.isText(n), split: true }
      );
    }
    
    // Check for Ctrl+I (Italic)
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      const [match] = Editor.nodes(editor, {
        match: n => SlateText.isText(n) && (n as CustomText).italic === true,
        universal: true,
      });
      
      Transforms.setNodes(
        editor,
        { italic: match ? false : true } as Partial<CustomText>,
        { match: n => SlateText.isText(n), split: true }
      );
    }
    
    // Check for Ctrl+U (Underline)
    if (event.ctrlKey && event.key === 'u') {
      event.preventDefault();
      const [match] = Editor.nodes(editor, {
        match: n => SlateText.isText(n) && (n as CustomText).underline === true,
        universal: true,
      });
      
      Transforms.setNodes(
        editor,
        { underline: match ? false : true } as Partial<CustomText>,
        { match: n => SlateText.isText(n), split: true }
      );
    }
    
    // Check for Ctrl+Z (Undo)
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      undo();
    }
    
    // Check for Ctrl+Shift+Z or Ctrl+Y (Redo)
    if ((event.ctrlKey && event.key === 'z' && event.shiftKey) || 
        (event.ctrlKey && event.key === 'y')) {
      event.preventDefault();
      redo();
    }
  }, [editor, undo, redo]);
  
  // Update cursor position and selection
  const handleSelectionChange = useCallback(() => {
    if (!editor.selection) return;
    
    // Get the current selection
    const { anchor, focus } = editor.selection;
    
    // If it's a cursor (not a selection)
    if (anchor.offset === focus.offset && anchor.path.toString() === focus.path.toString()) {
      updateCursor(anchor.offset);
    } else {
      // It's a selection
      updateSelection(anchor.offset, focus.offset);
    }
  }, [editor.selection, updateCursor, updateSelection]);
  
  // Listen for selection changes
  useEffect(() => {
    if (!editor) return;
    
    const { selection } = editor;
    if (selection) {
      handleSelectionChange();
    }
  }, [editor, editor.selection, handleSelectionChange]);
  
  return (
    <div className="collaborative-editor">
      {/* Editor toolbar */}
      <div className="flex items-center space-x-2 mb-3 p-2 bg-gray-100 rounded">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            Transforms.setNodes(
              editor,
              { bold: true } as Partial<CustomText>,
              { match: n => SlateText.isText(n), split: true }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Bold (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            Transforms.setNodes(
              editor,
              { italic: true } as Partial<CustomText>,
              { match: n => SlateText.isText(n), split: true }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Italic (Ctrl+I)"
        >
          <span className="italic">I</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            Transforms.setNodes(
              editor,
              { underline: true } as Partial<CustomText>,
              { match: n => SlateText.isText(n), split: true }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Underline (Ctrl+U)"
        >
          <span className="underline">U</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            Transforms.setNodes(
              editor,
              { code: true } as Partial<CustomText>,
              { match: n => SlateText.isText(n), split: true }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Code"
        >
          <span className="font-mono">{'<>'}</span>
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-1"></div>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            // Apply heading-one formatting
            Transforms.setNodes<CustomElement>(
              editor,
              { type: 'heading-one' } as Partial<CustomElement>,
              { match: (n): n is CustomElement => Element.isElement(n) && Editor.isBlock(editor, n) }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Heading 1"
        >
          <span className="font-bold">H1</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            // Apply heading-two formatting
            Transforms.setNodes<CustomElement>(
              editor,
              { type: 'heading-two' } as Partial<CustomElement>,
              { match: (n): n is CustomElement => Element.isElement(n) && Editor.isBlock(editor, n) }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Heading 2"
        >
          <span className="font-bold">H2</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            // Apply paragraph formatting
            Transforms.setNodes<CustomElement>(
              editor,
              { type: 'paragraph' } as Partial<CustomElement>,
              { match: (n): n is CustomElement => Element.isElement(n) && Editor.isBlock(editor, n) }
            );
          }}
          className="p-1 rounded hover:bg-gray-200"
          title="Paragraph"
        >
          <span>¶</span>
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-1"></div>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            undo();
          }}
          disabled={!canUndo}
          className={`p-1 rounded ${canUndo ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
          title="Undo (Ctrl+Z)"
        >
          <span>↩</span>
        </button>
        
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            redo();
          }}
          disabled={!canRedo}
          className={`p-1 rounded ${canRedo ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'}`}
          title="Redo (Ctrl+Y)"
        >
          <span>↪</span>
        </button>
      </div>
      
      {/* Connection status */}
      <div className="mb-3">
        <div className="flex items-center">
          <span className="font-semibold mr-2">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected && isInRoom ? 'bg-green-100 text-green-800' : 
            isConnected ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {isConnected && isInRoom ? 'Connected to room' : 
             isConnected ? 'Connected, not in room' : 
             'Disconnected'}
          </span>
        </div>
      </div>
      
      {/* Active users */}
      {activeUsers.length > 0 && (
        <div className="mb-3">
          <h3 className="font-semibold mb-1">Active Users:</h3>
          <div className="flex -space-x-2 overflow-hidden">
            {activeUsers.map(presence => (
              <div 
                key={presence.user.id} 
                className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                style={{ backgroundColor: presence.color }}
                title={presence.user.name}
              >
                <span className="flex items-center justify-center h-full text-white font-semibold">
                  {presence.user.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Slate editor */}
      <div className="border rounded p-3 min-h-[300px] bg-white">
        <Slate
          editor={editor}
          initialValue={value}
          onChange={newValue => {
            setValue(newValue);
            handleSelectionChange();
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={handleKeyDown}
            placeholder="Start typing..."
            className="min-h-[280px] focus:outline-none"
          />
        </Slate>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Keyboard shortcuts:</strong> Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline), Ctrl+Z (Undo), Ctrl+Y (Redo)
        </p>
      </div>
    </div>
  );
};

// Use SlateText.isText instead of this custom helper

export default CollaborativeEditor;
