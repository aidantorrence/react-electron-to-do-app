/* eslint-disable import/no-cycle */
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
import { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useStore } from './App';
import './App.css';
import config from './utils/config';
import formatTime from './utils/formatTime';

function resizeTextAreas(listItems: any, heightsRef: any) {
  if (!listItems.length) return;
  const heights = heightsRef.current;
  for (const height of heights) {
    if (!height?.style) continue;
    height.style.height = '0px';
    height.style.height = `${height.scrollHeight}px`;
  }
}

export default function Notes() {
  // const [listItems, setListItems] = useState(
  //   JSON.parse(localStorage.getItem('listItems') || '[]') || []
  // ) as any;
  const heightsRef = useRef([]) as any;
  const timer = useStore((state) => state.timer);
  const listItems = useStore((state) => state.listItems);
  const setListItems = useStore((state) => state.setListItems);

  const reorder = (list: any, startIndex: any, endIndex: any) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        setListItems([...listItems, { id: Date.now(), content: '' }]);
      }
    },
    [listItems, setListItems]
  );

  useLayoutEffect(() => {
    resizeTextAreas(listItems, heightsRef);
    localStorage.setItem('listItems', JSON.stringify(listItems));
  }, [listItems, setListItems]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      resizeTextAreas(listItems, heightsRef);
    });
    return () =>
      window.removeEventListener('resize', () => {
        resizeTextAreas(listItems, heightsRef);
      });
  }, [handleKeyDown, listItems]);

  const handleItems = (e: any, listIdx: number) => {
    setListItems(
      listItems.map((item: any, idx: number) =>
        idx === listIdx ? { ...item, content: e.target.value } : item
      )
    );
  };

  const handleComplete = (listIdx: number) => {
    fetch(`${config.api}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: listItems[listIdx].content,
        authorId: 1,
        completed: true,
      }),
    });
    setListItems(listItems.filter((_: any, idx: number) => idx !== listIdx));
    heightsRef.current = heightsRef.current.filter(
      (_: any, idx: number) => idx !== listIdx
    );
  };
  const handleDelete = (listIdx: number) => {
    fetch(`${config.api}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: listItems[listIdx].content,
        authorId: 1,
        completed: false,
      }),
    });
    setListItems(listItems.filter((_: any, idx: number) => idx !== listIdx));
    heightsRef.current = heightsRef.current.filter(
      (_: any, idx: number) => idx !== listIdx
    );
  };

  function onDragEnd(result: any) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const listItemsReordered = reorder(
      listItems,
      result.source.index,
      result.destination.index
    );
    setListItems(listItemsReordered);
  }

  return (
    <div className="main">
      {/*  {formatTime(timer)} */}
      <div className="notes-header">
        <div className="notes-stopwatch">short, actionable tasks</div>
        <button
          className="list-add-button"
          onClick={() =>
            setListItems([{ id: Date.now(), content: '' }, ...listItems])
          }
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(drop, _) => (
            <div
              ref={drop.innerRef}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...drop.droppableProps}
            >
              {listItems.map((item: any, listIdx: number) => {
                return (
                  <Draggable
                    key={item.id}
                    draggableId={`draggable-${item.id}`}
                    index={listIdx}
                  >
                    {(provided, snapshot) => (
                      <div
                        className="list-item"
                        ref={provided.innerRef}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          ...provided.draggableProps.style,
                          boxShadow: snapshot.isDragging
                            ? '0 0 .4rem #666'
                            : 'none',
                        }}
                      >
                        <div className="drag-handle" />
                        <textarea
                          ref={(el) => (heightsRef.current[listIdx] = el)}
                          className="text-area"
                          autoFocus
                          onChange={(e) => handleItems(e, listIdx)}
                          value={listItems[listIdx].content}
                          spellCheck="false"
                        />
                        <button
                          className="complete-button"
                          onClick={() => handleComplete(listIdx)}
                        />
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(listIdx)}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {drop.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
