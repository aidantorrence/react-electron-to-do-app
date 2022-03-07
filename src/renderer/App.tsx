/* eslint-disable no-new */
/* eslint-disable import/no-cycle */
import create from 'zustand';
import { useEffect, useCallback } from 'react';
import { Routes, useNavigate, Route, Link } from 'react-router-dom';
import CurrentTask from './CurrentTask';
import Notes from './Notes';

export const useStore = create((set: any) => ({
  currentTask: '',
  setCurrentTask: (input: string) => set({ currentTask: input }),
}));

export default function App() {
  const currentTask = useStore((state) => state.currentTask);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.metaKey && e.key === 'ArrowRight') {
        e.preventDefault();
        navigate('/currentTask');
      }
      if (e.metaKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate('/index.html');
      }
    },
    [navigate]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      new Notification('count to 10, then re-focus', {
        body: currentTask,
        requireInteraction: true,
      });
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [currentTask]);
  useEffect(() => {}, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <Routes>
        <Route path="/index.html" element={<Notes />} />
        <Route path="currentTask" element={<CurrentTask />} />
      </Routes>
    </>
  );
}
