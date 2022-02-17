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
import { useRef, useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';
import dragHandle from './drag-handle.svg';

export default function App() {
  const [listItems, setListItems] = useState(
    JSON.parse(localStorage.getItem('listItems') || '[]') || []
  ) as any;
  const [listChecked, setListChecked] = useState(
    JSON.parse(localStorage.getItem('listChecked') || '[]') || []
  ) as any;
  const heightsRef = useRef([]) as any;

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
        setListChecked([...listChecked, false]);
      }
    },
    [listChecked, listItems]
  );

  useEffect(() => {
    localStorage.setItem('listChecked', JSON.stringify(listChecked));
  }, [listChecked]);

  useEffect(() => {
    if (!listItems.length) return;
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

  const handleItems = (e: any, listIdx: number) => {
    setListItems(
      listItems.map((item: any, idx: number) =>
        idx === listIdx ? { ...item, content: e.target.value } : item
      )
    );
  };

  const handleDelete = (listIdx: number) => {
    setListItems(listItems.filter((_: any, idx: number) => idx !== listIdx));
    setListChecked(
      listChecked.filter((_: boolean, idx: number) => idx !== listIdx)
    );
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
    const listCheckedReordered = reorder(
      listChecked,
      result.source.index,
      result.destination.index
    );

    setListItems(listItemsReordered);
    setListChecked(listCheckedReordered);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(drop, _) => (
          <div
            className="main"
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
                      <img
                        alt="drag-handle"
                        className="drag-handle"
                        src={dragHandle}
                      />
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
                        value={listItems[listIdx].content}
                        spellCheck="false"
                        style={
                          listChecked[listIdx]
                            ? { textDecoration: 'line-through' }
                            : {}
                        }
                      />
                      {listChecked[listIdx] && (
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(listIdx)}
                        />
                      )}
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
  );
}
