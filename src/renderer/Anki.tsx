/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
import { useCallback, useEffect, useState } from 'react';
import create from 'zustand';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import config from './utils/config';

const useStore = create((set: any) => ({
  anki: {} as any,
  setAnki: (input: any) => set({ anki: input }),
}));

export function AnkiTitle() {
  const setAnki = useStore((state) => state.setAnki);
  const anki = useStore((state) => state.anki);
  const navigate = useNavigate();

  const fetchAnki = useCallback(async () => {
    const response = await fetch(`${config.api}/anki-to-review`);
    const data = await response.json();
    setAnki(data[0] || {});
  }, [setAnki]);

  const handleClick = useCallback(
    (difficulty: string) => {
      let newDaysToAdd = anki.daysToAdd;
      if (difficulty === 'hard') {
        newDaysToAdd = 2;
      } else if (difficulty === 'medium') {
        newDaysToAdd += 4;
      } else if (difficulty === 'easy') {
        newDaysToAdd += 8;
      } else if (difficulty === 'skip') {
        newDaysToAdd = 0;
      } else {
        newDaysToAdd += 32;
      }
      fetch(`${config.api}/anki`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysToAdd: newDaysToAdd,
          reviewDate: DateTime.now().plus({ days: newDaysToAdd }).toISO(),
          lastReviewedDate: DateTime.now().toISO(),
          id: anki.id,
        }),
      });
      navigate('/ankiSolution');
    },
    [anki, navigate]
  );

  const handleKeyDown = useCallback(
    async (e) => {
      if (e.metaKey && e.key === '5') {
        e.preventDefault();
        handleClick('skip');
      }
      if (e.metaKey && e.key === '4') {
        e.preventDefault();
        handleClick('very-easy');
      }
      if (e.metaKey && e.key === '3') {
        e.preventDefault();
        handleClick('easy');
      }
      if (e.metaKey && e.key === '2') {
        e.preventDefault();
        handleClick('medium');
      }
      if (e.metaKey && e.key === '1') {
        e.preventDefault();
        handleClick('hard');
      }
      if (e.metaKey && e.key === 'Backspace') {
        e.preventDefault();
        await fetch(`${config.api}/anki`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: anki.id,
          }),
        });
        fetchAnki();
      }
      if (e.metaKey && e.key === 's') {
        e.preventDefault();
        updateAnki(anki);
      }
    },
    [handleClick, anki, fetchAnki]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    fetchAnki();
  }, [fetchAnki, setAnki]);

  return (
    <>
      <div className="anki-container">
        <textarea
          spellCheck="false"
          className="anki-title"
          onChange={(e) => setAnki({ ...anki, title: e.target.value })}
          value={anki.title}
        />
      </div>
      {Object.keys(anki).length !== 0 && (
        <div className="anki-buttons">
          <button
            onClick={() => handleClick('hard')}
            className="anki-button hard"
          >
            😨
          </button>
          <button
            onClick={() => handleClick('medium')}
            className="anki-button medium"
          >
            😑
          </button>
          <button
            onClick={() => handleClick('easy')}
            className="anki-button easy"
          >
            😎
          </button>
          <button
            onClick={() => handleClick('very-easy')}
            className="anki-button very-easy"
          >
            🌟
          </button>
          <button
            onClick={() => handleClick('skip')}
            className="anki-button skip"
          >
            ⏭
          </button>
        </div>
      )}
    </>
  );
}

export function AnkiSolution() {
  const setAnki = useStore((state) => state.setAnki);
  const anki = useStore((state) => state.anki);
  const navigate = useNavigate();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault();
        navigate('/ankiTitle');
        window.electron.focusBrowserBig();
      }
      if (e.metaKey && e.key === 's') {
        e.preventDefault();
        updateAnki(anki);
      }
    },
    [anki, navigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <textarea
      spellCheck="false"
      value={anki.solution}
      onChange={(e) => setAnki({ ...anki, solution: e.target.value })}
      className="anki-solution"
    />
  );
}

export function AnkiCreate() {
  const [anki, setAnki] = useState({
    title: '',
    solution: '',
    topic: '',
  } as any);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`${config.api}/anki`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...anki, authorId: 1 }),
    });
    navigate('/ankiTitle');
  }

  return (
    <form className="anki-form" onSubmit={handleSubmit}>
      <label>Title</label>
      <textarea
        className="anki-form-title"
        value={anki.title}
        onChange={(e) => setAnki({ ...anki, title: e.target.value })}
      />
      <label>Solution</label>
      <textarea
        className="anki-form-solution"
        value={anki.solution}
        onChange={(e) => setAnki({ ...anki, solution: e.target.value })}
      />
      <label>Topic</label>
      <textarea
        className="anki-form-topic"
        value={anki.topic}
        onChange={(e) => setAnki({ ...anki, topic: e.target.value })}
      />
      <input type="submit" value="Add" />
    </form>
  );
}

async function updateAnki(anki: any) {
  await fetch(`${config.api}/anki`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(anki),
  });
}
