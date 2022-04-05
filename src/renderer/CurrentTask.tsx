/* eslint-disable react/button-has-type */
/* eslint-disable no-alert */
/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useStore } from './App';
import config from './utils/config';

export default function CurrentTask() {
  const setCurrentTask = useStore((state) => state.setCurrentTask);
  const currentTask = useStore((state) => state.currentTask);
  const distracted = useStore((state) => state.distracted);
  const setTheme = useStore((state) => state.setTheme);
  const theme = useStore((state) => state.theme);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const { scrollHeight } = textareaRef.current;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
    setCurrentTask(localStorage.getItem('currentTask') || '');
  }, [currentTask, setCurrentTask]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.metaKey && e.keyCode === 13) {
        e.preventDefault();
        if (window.confirm('Are you sure you want to complete this task?')) {
          fetch(`${config.api}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: currentTask,
              authorId: 1,
            }),
          });
          localStorage.removeItem('currentTask');
          setCurrentTask('');
        }
      }
      if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        setTheme(theme === 'light' ? 'dark' : 'light');
      }
    },
    [currentTask, setCurrentTask, setTheme, theme]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function handleChange(e: any) {
    localStorage.setItem('currentTask', e.target.value);
    setCurrentTask(e.target.value);
  }

  return (
    <div className="currentTaskContainer">
      <div className="currentTaskGrid">
        <div className={`currentTask ${theme} distracted-${distracted}`} />
      </div>
      <textarea
        ref={textareaRef}
        className={`current-task-text-area current-task-text-area-${theme}`}
        autoFocus
        onChange={handleChange}
        value={currentTask}
        spellCheck="false"
      />
    </div>
  );
}
