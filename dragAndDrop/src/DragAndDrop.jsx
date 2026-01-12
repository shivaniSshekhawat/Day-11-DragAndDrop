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

  function handleDragEnter(_, idx, heading) {
    dragOverItem.current = { idx, heading };
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop() {
    const source = dragItem.current;
    const dest = dragOverItem.current;
    if (!source || !dest) return;

    setData((pre) => {
      const destinationIndex =
        typeof dest.idx === "number" ? dest.idx : pre[dest.heading].length;

      if (source.heading === dest.heading) {
        const list = [...pre[source.heading]];
        const [removed] = list.splice(source.idx, 1);
        list.splice(destinationIndex, 0, removed);

        return {
          ...pre,
          [source.heading]: list,
        };
      } else {
        const sourceList = [...pre[source.heading]];
        const destList = [...pre[dest.heading]];
        const [removed] = sourceList.splice(source.idx, 1);
        destList.splice(destinationIndex, 0, removed);

        return {
          ...pre,
          [source.heading]: sourceList,
          [dest.heading]: destList,
        };
      }
    });

    dragItem.current = null;
    dragOverItem.current = null;
  }

  const columnColors = {
    BACKLOG: "#38bdf8",
    IN_PROGRESS: "#facc15",
    REVIEW: "#a78bfa",
    DONE: "#22c55e",
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div style={style.root}>
        {mainHeadings.map((heading) => (
          <div
            key={heading}
            style={{
              ...style.column,
              borderTop: `4px solid ${columnColors[heading]}`,
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div style={style.columnHeader}>
              {heading.replace("_", " ")}
              <span style={style.count}>{data[heading].length}</span>
            </div>

            {/* 👇 THIS IS THE KEY FIX */}
            <div
              style={style.taskList}
              onDragEnter={() =>
                handleDragEnter(
                  null,
                  data[heading].length, // allows empty & bottom drop
                  heading
                )
              }
            >
              {data[heading].map((task, idx) => (
                <div
                  key={task.id}
                  draggable
                  style={{ ...style.task, ...popAnimation }}
                  onDragStart={(e) => handleStartDrag(e, task, heading, idx)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={() => handleDragEnter(null, idx, heading)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-3px) scale(1.02)";
                    e.currentTarget.style.boxShadow =
                      "0 20px 40px rgba(56,189,248,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = style.task.boxShadow;
                  }}
                >
                  <p style={style.taskTitle}>{task.title}</p>
                  <span style={style.taskTag}>TASK</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DragAndDrop;

/* =================== Animations =================== */

const popAnimation = {
  animation: "popIn 0.35s ease forwards",
};

const globalStyles = `
@keyframes popIn {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
`;

/* =================== Styles =================== */

const style = {
  root: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    gap: "24px",
    padding: "32px",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    fontFamily: "'Inter', sans-serif",
  },

  column: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(18px)",
    borderRadius: "18px",
    padding: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
  },

  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#e5e7eb",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },

  count: {
    background: "rgba(255,215,0,0.15)",
    color: "#FFD700",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "0.7rem",
  },

  taskList: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "40px", // 👈 allows dropping into empty column
  },

  task: {
    background: "linear-gradient(145deg, #111827, #020617)",
    borderRadius: "14px",
    padding: "14px",
    cursor: "grab",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    transition: "all 0.25s ease",
  },

  taskTitle: {
    color: "#f9fafb",
    fontSize: "0.9rem",
    fontWeight: 500,
    marginBottom: "6px",
  },

  taskTag: {
    fontSize: "0.7rem",
    color: "#fff",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    padding: "2px 10px",
    borderRadius: "999px",
    width: "fit-content",
  },
};
