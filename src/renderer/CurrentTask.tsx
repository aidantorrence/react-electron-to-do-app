/* eslint-disable react/button-has-type */
/* eslint-disable no-alert */
/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-autofocus */
import { useRef, useState, useEffect } from 'react';
import { useStore } from './App';
import formatTime from './utils/formatTime';

function resizeTextArea(textareaRef: any) {
  if (textareaRef && textareaRef.current) {
    textareaRef.current.style.height = '0px';
    const { scrollHeight } = textareaRef.current;
    textareaRef.current.style.height = `${scrollHeight}px`;
  }
}

export default function CurrentTask() {
  const distracted = useStore((state) => state.distracted);
  const theme = useStore((state) => state.theme);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const timer = useStore((state) => state.timer);

  const [currentTask, setCurrentTask] = useState(
    JSON.parse(localStorage.getItem('listItems') || '[{"content":""}]')[0]
      .content
  );

  useEffect(() => {
    window.addEventListener('resize', () => {
      resizeTextArea(textareaRef);
    });
    return () =>
      window.removeEventListener('resize', () => {
        resizeTextArea(textareaRef);
      });
  }, [textareaRef]);

  return (
    <div className="currentTaskContainer">
      <div className="currentTaskGrid">
        <div className={`currentTask ${theme} distracted-${distracted}`} />
      </div>
      <div className="current-task-stopwatch">{formatTime(timer)}</div>
      <textarea
        ref={textareaRef}
        className={`current-task-text-area current-task-text-area-${theme}`}
        autoFocus
        value={`${currentTask} (~5min)`}
        spellCheck="false"
      />
    </div>
  );
}
