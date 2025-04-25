import { useEffect, useCallback, useState } from 'react';
import { useYjsContext } from './useYjsContext';
import useAuthStore from '@/store/authStore';
import { UserPresence } from './useYjs';

// Using UserPresence type from useYjs for consistency

/**
 * Hook to manage user presence awareness
 * Handles cursor positions, selections, and active users
 */
export const usePresenceAwareness = (_documentId: string) => {
  const yjsContext = useYjsContext();
  const { user } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Generate a random color for the user
  const getRandomColor = useCallback(() => {
    const colors = [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Set up awareness state
  useEffect(() => {
    if (!yjsContext.awareness || !user) return;

    const awareness = yjsContext.awareness;
    const userColor = getRandomColor();

    // Set initial local state
    awareness.setLocalState({
      user: {
        id: user.id,
        name: user.name,
      },
      color: userColor,
    });

    setIsReady(true);

    // Clean up on unmount
    return () => {
      // Clear local state when component unmounts
      if (awareness) {
        awareness.setLocalState(null);
      }
    };
  }, [yjsContext.awareness, user, getRandomColor]);

  // Update cursor position
  const updateCursor = useCallback(
    (index: number) => {
      if (!yjsContext.awareness || !isReady) return;

      const awareness = yjsContext.awareness;
      const currentState = awareness.getLocalState() as UserPresence;

      if (currentState) {
        awareness.setLocalState({
          ...currentState,
          cursor: {
            index,
          },
        } as UserPresence);
      }
    },
    [yjsContext.awareness, isReady]
  );

  // Update selection
  const updateSelection = useCallback(
    (anchor: number, head: number) => {
      if (!yjsContext.awareness || !isReady) return;

      const awareness = yjsContext.awareness;
      const currentState = awareness.getLocalState() as UserPresence;

      if (currentState) {
        awareness.setLocalState({
          ...currentState,
          selection: {
            anchor,
            head,
          },
        } as UserPresence);
      }
    },
    [yjsContext.awareness, isReady]
  );

  // Track active users
  useEffect(() => {
    if (!yjsContext.awareness || !user) return;

    const awareness = yjsContext.awareness;

    // Function to update active users
    const updateActiveUsers = () => {
      const states = awareness.getStates() as Map<number, UserPresence>;
      const users: UserPresence[] = [];

      states.forEach((state, _clientId) => {
        // Only include users with valid state and filter out current user
        if (state && state.user && state.user.id !== user.id) {
          users.push(state);
        }
      });

      setActiveUsers(users);
    };

    // Update active users initially
    updateActiveUsers();

    // Listen for awareness changes
    const handleAwarenessUpdate = (_: { added: number[], updated: number[], removed: number[] }) => {
      updateActiveUsers();
    };

    awareness.on('update', handleAwarenessUpdate);

    // Clean up
    return () => {
      awareness.off('update', handleAwarenessUpdate);
    };
  }, [yjsContext.awareness, user]);

  return {
    activeUsers,
    updateCursor,
    updateSelection,
    isReady,
  };
};

export default usePresenceAwareness;
