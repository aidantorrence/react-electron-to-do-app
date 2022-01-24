/* eslint-disable promise/no-nesting */
/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-continue */
/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-return-assign */
/* eslint-disable react/button-has-type */
/* eslint-disable no-restricted-syntax */
import { useRef, useState, useEffect, useCallback } from 'react';
import './App.css';

export default function App() {
  const [listItems, setListItems] = useState([] as any);
  const heightsRef = useRef([]) as any;

  const handleKeyDown = useCallback((e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      fetch('http://localhost:8080/notion', {
        body: JSON.stringify({ text: 'hello' }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }, []);

  useEffect(() => {
    async function getAllItems() {
      try {
        const res = await fetch('http://localhost:8080/notion');
        const data = await res.json();
        setListItems(JSON.parse(data)?.results);
      } catch (e) {
        console.log(e);
      }
    }
    getAllItems();
  }, []);

  useEffect(() => {
    const heights = heightsRef.current;
    for (const height of heights) {
      if (!height?.style) continue;
      height.style.height = '0px';
      height.style.height = `${height.scrollHeight}px`;
    }
    localStorage.setItem('listItems', JSON.stringify(listItems));
  }, [listItems]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDelete = (listIdx: number) => {
    heightsRef.current = heightsRef.current.filter(
      (_: any, idx: number) => idx !== listIdx
    );
  };

  return (
    <div className="main">
      {listItems.map((item: string, listIdx: number) => {
        return (
          <div className="list-item" key={listIdx}>
            <input
              className="check-box"
              type="checkbox"
              checked={listChecked[listIdx]}
              onChange={(e) =>
                setListChecked(
                  listChecked.map((check: string, idx: number) =>
                    idx === listIdx ? e.target.checked : check
                  )
                )
              }
            />

            <textarea
              ref={(el) => (heightsRef.current[listIdx] = el)}
              className="text-area"
              autoFocus
              onChange={(e) => handleItems(e, listIdx)}
              value={listItems[listIdx]}
              spellCheck="false"
              style={
                listChecked[listIdx] ? { textDecoration: 'line-through' } : {}
              }
            />
            {listChecked[listIdx] && (
              <button
                className="delete-button"
                onClick={() => handleDelete(listIdx)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
