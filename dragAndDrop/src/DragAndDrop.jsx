import React, { useEffect, useRef, useState } from "react";

const DragAndDrop = ({ data: initialData }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("tasks-data");
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem("tasks-data", JSON.stringify(data));
  }, [data]);

  const dragItem = useRef(null);
  const dropTarget = useRef(null);

  function onDragStart(task, heading, idx) {
    dragItem.current = { task, heading, idx };
  }

  function onDrop(heading, index) {
    const source = dragItem.current;
    if (!source) return;

    setData((prev) => {
      const sourceList = [...prev[source.heading]];
      const destList = [...prev[heading]];

      const [moved] = sourceList.splice(source.idx, 1);
      destList.splice(index, 0, moved);

      return {
        ...prev,
        [source.heading]: sourceList,
        [heading]: destList,
      };
    });

    dragItem.current = null;
  }

  return (
    <div style={style.root}>
      {Object.keys(data).map((heading) => (
        <div key={heading} style={style.column}>
          <div style={style.header}>
            {heading.replace("_", " ")}
            <span>{data[heading].length}</span>
          </div>

          <div style={style.list}>
            {data[heading].map((task, idx) => (
              <div
                key={task.id}
                draggable
                style={style.task}
                onDragStart={() => onDragStart(task, heading, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(heading, idx)}
              >
                {task.title}
              </div>
            ))}

            {/* 🔥 REAL DROP ZONE FOR EMPTY LIST */}
            {data[heading].length === 0 && (
              <div
                style={style.emptyDrop}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(heading, 0)} // ✅ 0th index
              >
                Drop here
              </div>
            )}

            {/* 🔥 DROP AT BOTTOM */}
            {data[heading].length > 0 && (
              <div
                style={style.bottomDrop}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(heading, data[heading].length)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragAndDrop;

/* ---------------- STYLES ---------------- */

const style = {
  root: {
    display: "flex",
    gap: 20,
    padding: 30,
    background: "#020617",
    minHeight: "100vh",
  },
  column: {
    flex: 1,
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    color: "#fff",
    marginBottom: 12,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  task: {
    background: "#1f2937",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
    cursor: "grab",
  },
  emptyDrop: {
    height: 80,
    border: "2px dashed #475569",
    borderRadius: 12,
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomDrop: {
    height: 12,
  },
};
