interface CollaboratorPresence {
  id: string;
  name: string;
  color: string;
}

interface UserPresenceIndicatorProps {
  collaborators: CollaboratorPresence[];
}

export default function UserPresenceIndicator({ collaborators }: UserPresenceIndicatorProps) {
  if (collaborators.length === 0) {
    return (
      <div className="text-sm text-neutral-500">
        No other users are currently viewing this document
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <span className="text-sm text-neutral-500 mr-2">
        {collaborators.length === 1
          ? '1 user is currently viewing this document:'
          : `${collaborators.length} users are currently viewing this document:`}
      </span>
      
      <div className="flex -space-x-1 overflow-hidden">
        {collaborators.slice(0, 5).map((collaborator) => (
          <div
            key={collaborator.id}
            className="relative inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white"
            style={{ backgroundColor: collaborator.color }}
            title={collaborator.name}
          >
            <span className="text-xs font-medium text-white">
              {collaborator.name.charAt(0)}
            </span>
          </div>
        ))}
        
        {collaborators.length > 5 && (
          <div className="relative inline-flex items-center justify-center h-6 w-6 rounded-full bg-neutral-300 ring-2 ring-white">
            <span className="text-xs font-medium text-white">
              +{collaborators.length - 5}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
