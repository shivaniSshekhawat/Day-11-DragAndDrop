import React, { useEffect, useRef, useState } from "react";

const DragAndDrop = ({ data: intialData }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("tasks-data");
    return savedData ? JSON.parse(savedData) : intialData;
  });

  useEffect(() => {
    localStorage.setItem("tasks-data", JSON.stringify(data));
  }, [data]);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  function handleStartDrag(e, task, heading, idx) {
    dragItem.current = { task, heading, idx };
    e.target.style.opacity = 0.6;
  }

  function handleDragEnd(e) {
    e.target.style.opacity = 1;
  }

  // 🔥 THIS IS THE KEY FIX
  function handleListDragOver(e, heading) {
    e.preventDefault(); // REQUIRED FOR DROP
    dragOverItem.current = {
      heading,
      idx: data[heading].length, // 0 if empty, bottom if not
    };
  }

  function handleTaskDragOver(e, heading, idx) {
    e.preventDefault();
    dragOverItem.current = { heading, idx };
  }

  function handleDrop() {
    const source = dragItem.current;
    const dest = dragOverItem.current;

    if (!source || !dest) return;

    setData((prev) => {
      const sourceList = [...prev[source.heading]];
      const destList = [...prev[dest.heading]];

      const [moved] = sourceList.splice(source.idx, 1);
      destList.splice(dest.idx, 0, moved);

      return {
        ...prev,
        [source.heading]: sourceList,
        [dest.heading]: destList,
      };
    });

    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div style={style.root}>
      {Object.keys(data).map((heading) => (
        <div key={heading} style={style.column}>
          <div style={style.columnHeader}>
            {heading.replace("_", " ")}
            <span>{data[heading].length}</span>
          </div>

          <div
            style={style.taskList}
            onDragOver={(e) => {
              e.preventDefault(); // 🔥 REQUIRED
              dragOverItem.current = {
                heading,
                idx: data[heading].length, // 0 if empty
              };
            }}
            onDrop={handleDrop} // 🔥 SAME ELEMENT
          >
            {data[heading].map((task, idx) => (
              <div
                key={task.id}
                draggable
                style={style.task}
                onDragStart={(e) => handleStartDrag(e, task, heading, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  dragOverItem.current = { heading, idx };
                }}
              >
                {task.title}
              </div>
            ))}

            {data[heading].length === 0 && (
              <div style={style.empty}>Drop task here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragAndDrop;

/* ---------------- Styles ---------------- */

const style = {
  root: {
    display: "flex",
    gap: "20px",
    padding: "30px",
    background: "#020617",
    minHeight: "100vh",
  },

  column: {
    flex: 1,
    background: "#111827",
    borderRadius: "16px",
    padding: "16px",
  },

  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#fff",
    marginBottom: "12px",
  },

  taskList: {
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  task: {
    background: "#1f2937",
    color: "#fff",
    padding: "12px",
    borderRadius: "10px",
    cursor: "grab",
  },

  empty: {
    border: "1px dashed #475569",
    color: "#94a3b8",
    padding: "20px",
    textAlign: "center",
    borderRadius: "10px",
  },
};
