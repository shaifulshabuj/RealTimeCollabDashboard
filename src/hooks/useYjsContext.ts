import { useContext } from 'react';
import { YjsContext } from '@/components/Collaboration/YjsProvider';

/**
 * Custom hook to use the Yjs context
 * This provides access to the Y.js document, awareness, and helper methods
 */
export const useYjsContext = () => useContext(YjsContext);

export default useYjsContext;
