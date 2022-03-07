/* eslint-disable import/no-cycle */
/* eslint-disable jsx-a11y/no-autofocus */
import { useStore } from './App';

export default function CurrentTask() {
  const setCurrentTask = useStore((state) => state.setCurrentTask);
  const currentTask = useStore((state) => state.currentTask);
  return (
    <div className="currentTask">
      <textarea
        className="text-area"
        autoFocus
        onChange={(e) => setCurrentTask(e.target.value)}
        value={currentTask}
        spellCheck="false"
      />
    </div>
  );
}
