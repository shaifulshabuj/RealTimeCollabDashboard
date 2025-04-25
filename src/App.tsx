import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import Dashboard from '@/components/Dashboard/Dashboard';
import DocumentEditor from '@/components/DocumentEditor/DocumentEditor';
import DocumentList from '@/components/DocumentList/DocumentList';
import NotFound from '@/components/NotFound/NotFound';
import CrdtOperationsDemo from '@/components/Demo/CrdtOperationsDemo';
import WebSocketSyncDemo from '@/components/Collaboration/WebSocketSyncDemo';
import PresenceAwarenessDemo from '@/components/Collaboration/PresenceAwarenessDemo';
import UndoRedoDemo from '@/components/Collaboration/UndoRedoDemo';
import CollaborativeEditorDemo from '@/components/Editor/CollaborativeEditorDemo';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<DocumentList />} />
        <Route path="documents/:id" element={<DocumentEditor />} />
        <Route path="crdt-demo" element={<CrdtOperationsDemo />} />
        <Route path="websocket-demo" element={<WebSocketSyncDemo />} />
        <Route path="presence-demo" element={<PresenceAwarenessDemo />} />
        <Route path="undo-redo-demo" element={<UndoRedoDemo />} />
        <Route path="collaborative-editor" element={<CollaborativeEditorDemo />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
