/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-new */
/* eslint-disable import/no-cycle */
import create from 'zustand';
import { useEffect, useCallback } from 'react';
import { Routes, useNavigate, Route } from 'react-router-dom';
import CurrentTask from './CurrentTask';
import Notes from './Notes';
import { AnkiSolution, AnkiTitle, AnkiCreate } from './Anki';
import config from './utils/config';

declare global {
  interface Window {
    electron: any;
  }
}

export const useStore = create((set: any) => ({
  currentTask: '',
  setCurrentTask: (input: string) => set({ currentTask: input }),
}));

export default function App() {
  const currentTask = useStore((state) => state.currentTask);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.metaKey && e.key === '=') {
        e.preventDefault();
        navigate('/currentTask');
        window.electron.focusBrowserSmall();
      }
      if (e.metaKey && e.key === '-') {
        e.preventDefault();
        navigate('/index.html');
        window.electron.focusBrowserMed();
      }
      if (e.metaKey && e.key === 'k') {
        e.preventDefault();
        navigate('/ankiTitle');
        window.electron.focusBrowserBig();
        window.electron.center();
      }
      if (e.metaKey && e.key === 'n') {
        e.preventDefault();
        navigate('/ankiCreate');
        window.electron.focusBrowserBig();
      }
    },
    [navigate]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      sendTaskNotification(currentTask);
    }, 1000 * 60 * 10);
    return () => clearInterval(interval);
  }, [currentTask, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      sendAnkiNotification();
    }, 800 * 60 * 45);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <Routes>
        <Route path="/index.html" element={<Notes />} />
        <Route path="currentTask" element={<CurrentTask />} />
        <Route path="/ankiTitle" element={<AnkiTitle />} />
        <Route path="/ankiSolution" element={<AnkiSolution />} />
        <Route path="/ankiCreate" element={<AnkiCreate />} />
      </Routes>
    </>
  );
}

async function sendAnkiNotification() {
  let title = '';
  let count = '';
  try {
    const ankiRes = await fetch(`${config.api}/anki-to-review`);
    const anki = await ankiRes.json();
    const ankisRes = await fetch(`${config.api}/ankis-completed-today`);
    const ankis = await ankisRes.json();
    title = anki[0].title || '';
    count = ankis[0].count || '';
  } catch (e) {
    console.log(e);
  }
  const notification = new Notification(title, {
    body: `${count} ankis completed today`,
    requireInteraction: true,
  });
  notification.onclick = (e) => {
    e.preventDefault(); // prevent the browser from focusing the Notification's tab
    window.electron.focusBrowserBig();
  };
}

async function sendTaskNotification(currentTask: string) {
  const response = await fetch(`${config.api}/tasks-completed-today`);
  const data = await response.json();
  new Notification(currentTask, {
    body: `${data.length} tasks completed today`,
    requireInteraction: true,
  });
  window.electron.center();
}
