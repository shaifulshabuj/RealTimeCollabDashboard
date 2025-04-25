# Real-Time Collaboration Dashboard

A real-time, Google Docs-style collaboration platform tailored for industrial/logistics workflows, built with React, TypeScript, Zustand, and Y.js.

## 🚀 Features

- **Real-time collaborative editing**: Multiple users can edit documents simultaneously
- **User presence indicators**: See who's currently viewing or editing a document
- **Change tracking**: View edit history and revision timeline
- **Comments & annotations**: Discuss specific parts of documents
- **Document versioning**: Create and restore document versions
- **Role-based access control**: Control who can view, edit, or manage documents
- **Specialized workflows**: Templates and components for industrial/logistics use cases
- **Offline support**: Continue working when disconnected with automatic sync on reconnection

## 🛠️ Technology Stack

- **Frontend Framework**: React + TypeScript
- **State Management**: Zustand
- **Real-time Collaboration**: Y.js + WebSocket
- **Styling**: TailwindCSS
- **Code Quality**: ESLint + Prettier
- **Build Tools**: Vite

## 🏗️ Architecture

The application follows a component-driven architecture with the following key aspects:

- **Real-time Collaboration Engine**: Uses Y.js CRDTs (Conflict-free Replicated Data Types) for seamless collaborative editing
- **Scalable State Management**: Zustand stores with middleware for efficient state updates
- **Component-First Design**: Modular, reusable UI components
- **Optimistic UI Updates**: Immediate local changes with background synchronization
- **Clean Separation of Concerns**: Clear boundaries between data, business logic, and presentation layers

## 📂 Project Structure

```
/src
  /components              # Reusable UI components 
    /Layout                # Layout components
    /Dashboard             # Dashboard views and components
    /DocumentEditor        # Document editing components
    /DocumentList          # Document listing and filtering
  /hooks                   # Custom React hooks
    useAuth.ts             # Authentication hook
    useDocument.ts         # Document management hook
    useYjs.ts              # Y.js integration hook
  /store                   # Zustand state management
    authStore.ts           # Authentication state
    documentStore.ts       # Document data state
    collaborationStore.ts  # Collaboration state
  /services                # API and service integrations
    websocketService.ts    # WebSocket service
    yjsService.ts          # Y.js integration service
  /types                   # TypeScript type definitions
    user.ts                # User-related types
    document.ts            # Document-related types
    collaboration.ts       # Collaboration-related types
  /utils                   # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/real-time-collab-dashboard.git
   cd real-time-collab-dashboard
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open http://localhost:3000 in your browser

## 📝 Development Workflow

1. **Planning**: Refer to PROJECT_PLANNING.md for project roadmap and goals
2. **Tasks**: Check TASKS.md for current development tasks and progress
3. **Code Style**: Follow ESLint and Prettier configurations
4. **Commits**: Use conventional commits format
5. **Testing**: Write tests for critical functionality

## 🧩 Key Components

### Document Editor

The document editor is the heart of the application, featuring:

- Rich text editing capabilities
- Real-time collaborative editing
- User presence indicators
- Comments and annotations
- Version history
- Collaborative cursors and selections

### Dashboard

The dashboard provides an overview of:

- Recent documents
- Documents needing attention
- Team activity
- Quick access to common functions
- Analytics on document usage

### Document List

The document list allows users to:

- Browse all documents
- Filter by status, type, or user
- Search for specific documents
- Manage document permissions
- Create new documents from templates

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Y.js](https://github.com/yjs/yjs) for real-time collaboration
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [TailwindCSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Vite](https://vitejs.dev/) for fast development
