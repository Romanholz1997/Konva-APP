// src/hooks/useHistory.ts
import { useRef, useCallback, useState } from 'react';

const MAX_HISTORY = 50; // Maximum number of history states

export const useHistory = <T>(initialState: T) => {
  const undoStack = useRef<T[]>([initialState]);
  const redoStack = useRef<T[]>([]);
  const [canUndo, setCanUndo] = useState(undoStack.current.length > 1); // Can undo if more than one state
  const [canRedo, setCanRedo] = useState(false);

  const addState = useCallback((state: T) => {
    undoStack.current.push(state);
    if (undoStack.current.length > MAX_HISTORY) {
      undoStack.current.shift(); // Remove the oldest state
    }
    setCanUndo(undoStack.current.length > 1);
    // Clear redo stack on new action
    redoStack.current = [];
    setCanRedo(false);
  }, []);

  const undo = useCallback((): T | null => {
    if (undoStack.current.length <= 1) return null; // Prevent undoing the initial state
    const prevState = undoStack.current.pop()!;
    redoStack.current.push(prevState);
    setCanUndo(undoStack.current.length > 1);
    setCanRedo(true);
    return undoStack.current[undoStack.current.length - 1];
  }, []);

  const redo = useCallback((): T | null => {
    if (redoStack.current.length === 0) return null;
    const nextState = redoStack.current.pop()!;
    undoStack.current.push(nextState);
    setCanRedo(redoStack.current.length > 0);
    setCanUndo(undoStack.current.length > 1);
    return nextState;
  }, []);

  return { addState, undo, redo, canUndo, canRedo };
};
