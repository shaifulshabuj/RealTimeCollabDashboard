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
import TemplatesPage from '@/components/Templates/TemplatesPage';
import TeamPage from '@/components/Team/TeamPage';
import SettingsPage from '@/components/Settings/SettingsPage';
import FilesPage from '@/components/Files/FilesPage';
import SharedFileViewer from '@/components/Files/SharedFileViewer';
import AdminPage from '@/components/Admin/AdminPage';
import ProfilePage from '@/components/Profile/ProfilePage';
import LoginPage from '@/components/Auth/LoginPage';
import RegisterPage from '@/components/Auth/RegisterPage';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/shared/:token" element={<SharedFileViewer />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<DocumentList />} />
              <Route path="documents/:id" element={<DocumentEditor />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="crdt-demo" element={<CrdtOperationsDemo />} />
              <Route path="websocket-demo" element={<WebSocketSyncDemo />} />
              <Route path="presence-demo" element={<PresenceAwarenessDemo />} />
              <Route path="undo-redo-demo" element={<UndoRedoDemo />} />
              <Route path="collaborative-editor" element={<CollaborativeEditorDemo />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
