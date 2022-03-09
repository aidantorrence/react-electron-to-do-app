/* eslint-disable react/button-has-type */
/* eslint-disable no-alert */
/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import { useStore } from './App';

export default function CurrentTask() {
  const setCurrentTask = useStore((state) => state.setCurrentTask);
  const currentTask = useStore((state) => state.currentTask);
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
        if (window.confirm('Are you sure you want to delete this task?')) {
          fetch('http://localhost:8080/tasks', {
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
    },
    [currentTask, setCurrentTask]
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
    <div className="currentTask">
      <textarea
        ref={textareaRef}
        className="text-area"
        autoFocus
        onChange={handleChange}
        value={currentTask}
        spellCheck="false"
      />
    </div>
  );
}
