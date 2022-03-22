/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-shadow */
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
import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import './App.css';
import config from './utils/config';

export default function Notes() {
  const [backlog, setBacklog] = useState([]) as any;
  const heightsRef = useRef([]) as any;

  useEffect(() => {
    async function fetchBacklog() {
      const res = await fetch(`${config.api}/backlog`);
      setBacklog(await res.json());
    }
    fetchBacklog();
  }, []);

  const handleComplete = async (listIdx: number) => {
    const completeRes = await fetch(`${config.api}/tasks`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: backlog[listIdx].id,
        completed: true,
      }),
    });
    await completeRes.text();
    const backlogRes = await fetch(`${config.api}/backlog`);
    setBacklog(await backlogRes.json());
  };
  const handleDelete = async (listIdx: number) => {
    const deleteRes = await fetch(`${config.api}/tasks`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: backlog[listIdx].id,
      }),
    });
    await deleteRes.text();
    const backlogRes = await fetch(`${config.api}/backlog`);
    setBacklog(await backlogRes.json());
  };

  return (
    <div className="main">
      {backlog.map((item: any, listIdx: number) => {
        return (
          <ul key={item.id} className="list-item">
            <li className="backlog-list-item">{backlog[listIdx].content}</li>
            <button
              className="complete-button"
              onClick={() => handleComplete(listIdx)}
            />
            <button
              className="delete-button"
              onClick={() => handleDelete(listIdx)}
            />
          </ul>
        );
      })}
    </div>
  );
}
