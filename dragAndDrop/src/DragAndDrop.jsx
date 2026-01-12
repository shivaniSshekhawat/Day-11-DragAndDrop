import React, { useEffect, useRef, useState } from "react";

const DragAndDrop = ({ data: intialData }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("tasks-data");
    return savedData ? JSON.parse(savedData) : intialData;
  });

  useEffect(() => {
    localStorage.setItem("tasks-data", JSON.stringify(data));
  }, [data]);

  const mainHeadings = Object.keys(data);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  function handleStartDrag(e, task, heading, idx) {
    e.target.style.opacity = 0.6;
    e.target.style.transform = "rotate(2deg) scale(1.05)";
    dragItem.current = { task, heading, idx };
  }

  function handleDragEnd(e) {
    e.target.style.opacity = 1;
    e.target.style.transform = "none";
  }

  function handleDragOverTask(_, idx, heading) {
    dragOverItem.current = { idx, heading };
  }

  function handleDragOverList(e, heading) {
    e.preventDefault(); // 🔥 REQUIRED
    dragOverItem.current = {
      heading,
      idx: data[heading].length, // 👈 works for empty & bottom
    };
  }

  function handleDrop() {
    const source = dragItem.current;
    const dest = dragOverItem.current;

    if (!source || !dest) return;

    setData((prev) => {
      const destinationIndex = dest.idx;

      if (source.heading === dest.heading) {
        const list = [...prev[source.heading]];
        const [removed] = list.splice(source.idx, 1);
        list.splice(destinationIndex, 0, removed);
        return { ...prev, [source.heading]: list };
      } else {
        const sourceList = [...prev[source.heading]];
        const destList = [...prev[dest.heading]];
        const [removed] = sourceList.splice(source.idx, 1);
        destList.splice(destinationIndex, 0, removed);
        return {
          ...prev,
          [source.heading]: sourceList,
          [dest.heading]: destList,
        };
      }
    });

    dragItem.current = null;
    dragOverItem.current = null;
  }

  return (
    <div style={style.root}>
      {mainHeadings.map((heading) => (
        <div key={heading} style={style.column} onDrop={handleDrop}>
          <div style={style.columnHeader}>
            {heading.replace("_", " ")}
            <span style={style.count}>{data[heading].length}</span>
          </div>

          {/* 🔥 THIS IS THE KEY FIX */}
          <div
            style={style.taskList}
            onDragOver={(e) => handleDragOverList(e, heading)}
          >
            {data[heading].map((task, idx) => (
              <div
                key={task.id}
                draggable
                style={style.task}
                onDragStart={(e) => handleStartDrag(e, task, heading, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOverTask(e, idx, heading)}
              >
                <p style={style.taskTitle}>{task.title}</p>
              </div>
            ))}

            {/* empty-state drop zone */}
            {data[heading].length === 0 && (
              <div style={style.emptyHint}>Drop tasks here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragAndDrop;

/* ================= Styles ================= */

const style = {
  root: {
    minHeight: "100vh",
    display: "flex",
    gap: "24px",
    padding: "32px",
    background: "#020617",
  },

  column: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    borderRadius: "18px",
    padding: "16px",
  },

  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e5e7eb",
    marginBottom: "12px",
  },

  count: {
    background: "#1f2937",
    padding: "2px 10px",
    borderRadius: "999px",
  },

  taskList: {
    minHeight: "80px", // 🔥 MUST EXIST
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  task: {
    background: "#111827",
    borderRadius: "12px",
    padding: "12px",
    cursor: "grab",
    color: "#f9fafb",
  },

  taskTitle: {
    fontSize: "0.9rem",
  },

  emptyHint: {
    color: "#64748b",
    fontSize: "0.8rem",
    textAlign: "center",
    padding: "16px",
    border: "1px dashed rgba(255,255,255,0.15)",
    borderRadius: "12px",
  },
};
