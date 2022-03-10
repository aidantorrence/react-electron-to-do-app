import { useCallback, useEffect, useState } from 'react';

export default function Anki() {
  const [currentAnki, setCurrentAnki] = useState({} as any);
  const handleKeyDown = useCallback((e) => {
    if (e.metaKey && e.keyCode === 13) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    async function fetchAnki() {
      const response = await fetch(
        'http://localhost:8080/least-recently-viewed-anki',
        {
          method: 'PATCH',
        }
      );
      const data = await response.json();
      setCurrentAnki(data[0]);
    }
    fetchAnki();
  }, []);

  return <div className="anki">{currentAnki?.title}</div>;
}
