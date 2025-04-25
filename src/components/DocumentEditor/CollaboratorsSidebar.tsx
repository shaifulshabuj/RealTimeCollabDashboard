import { useState } from 'react';
import { 
  XMarkIcon, 
  UserPlusIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { UserRole } from '@/types/user';

interface Collaborator {
  id: string;
  name: string;
  color: string;
}

interface CollaboratorsSidebarProps {
  documentId: string;
  collaborators: Collaborator[];
  onClose: () => void;
}

export default function CollaboratorsSidebar({
  documentId,
  collaborators,
  onClose,
}: CollaboratorsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.EDITOR);
  
  // Mock data for users that could be added as collaborators
  const availableUsers = [
    { id: 'user-5', name: 'Sarah Johnson', email: 'sarah.j@example.com', department: 'Marketing' },
    { id: 'user-6', name: 'Michael Chen', email: 'michael.c@example.com', department: 'Operations' },
    { id: 'user-7', name: 'Aisha Patel', email: 'aisha.p@example.com', department: 'Finance' },
    { id: 'user-8', name: 'Carlos Rodriguez', email: 'carlos.r@example.com', department: 'IT' },
  ];
  
  // Filter available users based on search term
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Check if a user is already a collaborator
  const isCollaborator = (userId: string) => {
    return collaborators.some((c) => c.id === userId);
  };
  
  // Mock function to add a collaborator
  const addCollaborator = (userId: string) => {
    console.log(`Adding user ${userId} as collaborator with role ${selectedRole}`);
    // In a real implementation, we would call an API to add the collaborator
  };
  
  // Mock function to remove a collaborator
  const removeCollaborator = (userId: string) => {
    console.log(`Removing collaborator ${userId}`);
    // In a real implementation, we would call an API to remove the collaborator
  };
  
  return (
    <div className="w-80 border-l border-neutral-200 bg-white flex flex-col h-full">
      <div className="border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-900 flex items-center">
          <UserPlusIcon className="h-5 w-5 text-neutral-500 mr-2" />
          Collaborators
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-500"
        >
          <XMarkIcon className="h-5 w-5" />
          <span className="sr-only">Close panel</span>
        </button>
      </div>
      
      {/* Current collaborators */}
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Current collaborators</h3>
        
        {collaborators.length === 0 ? (
          <p className="text-sm text-neutral-500">No collaborators yet</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((collaborator) => (
              <li key={collaborator.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    <span className="text-xs font-medium">{collaborator.name.charAt(0)}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">{collaborator.name}</p>
                    <p className="text-xs text-neutral-500">Editor</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeCollaborator(collaborator.id)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <XCircleIcon className="h-5 w-5" />
                  <span className="sr-only">Remove</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Add collaborators */}
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-2">Add people</h3>
        
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search by name, email, or department"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mt-2">
          <label htmlFor="role-select" className="block text-xs font-medium text-neutral-700">
            Role
          </label>
          <select
            id="role-select"
            name="role"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          >
            <option value={UserRole.VIEWER}>Viewer (can view)</option>
            <option value={UserRole.EDITOR}>Editor (can edit)</option>
            <option value={UserRole.MANAGER}>Manager (can manage)</option>
          </select>
        </div>
      </div>
      
      {/* Search results */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm.length > 0 && (
          <div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider bg-neutral-50 border-b border-neutral-200">
            Search Results
          </div>
        )}
        
        {filteredUsers.length > 0 ? (
          <ul className="divide-y divide-neutral-200">
            {filteredUsers.map((user) => (
              <li key={user.id} className="px-4 py-3 hover:bg-neutral-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-neutral-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                      <p className="text-xs text-neutral-500">{user.department}</p>
                    </div>
                  </div>
                  
                  {isCollaborator(user.id) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addCollaborator(user.id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <PlusIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Add</span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : searchTerm.length > 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-neutral-500">No users found matching "{searchTerm}"</p>
          </div>
        ) : null}
      </div>
      
      {/* Invite by email */}
      <div className="p-4 border-t border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-2">Invite by email</h3>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input
              type="email"
              className="block w-full rounded-none rounded-l-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <button
            type="button"
            className="relative inline-flex items-center space-x-2 px-4 py-2 border border-neutral-300 text-sm font-medium rounded-r-md text-neutral-700 bg-neutral-50 hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <span>Invite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
