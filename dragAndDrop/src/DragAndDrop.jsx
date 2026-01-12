import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ---------------- TASK CARD ---------------- */

function Task({ id, title }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "linear-gradient(145deg, #111827, #020617)",
    borderRadius: 14,
    padding: 14,
    cursor: "grab",
    color: "#f9fafb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <p style={{ marginBottom: 6 }}>{title}</p>
      <span
        style={{
          fontSize: "0.7rem",
          padding: "2px 10px",
          borderRadius: 999,
          background: "linear-gradient(90deg,#38bdf8,#6366f1)",
        }}
      >
        TASK
      </span>
    </div>
  );
}

/* ---------------- BOARD ---------------- */

const DragAndDrop = ({ data: initialData }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("tasks-data");
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem("tasks-data", JSON.stringify(data));
  }, [data]);

  function findColumn(taskId) {
    return Object.keys(data).find((col) =>
      data[col].some((t) => t.id === taskId)
    );
  }

  function onDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const sourceCol = findColumn(active.id);
    const destCol = over.data.current?.column;

    if (!sourceCol || !destCol) return;

    const sourceIndex = data[sourceCol].findIndex((t) => t.id === active.id);

    const destIndex = over.data.current?.index ?? data[destCol].length; // 👈 0 if empty

    setData((prev) => {
      const sourceItems = [...prev[sourceCol]];
      const destItems =
        sourceCol === destCol ? sourceItems : [...prev[destCol]];

      const [moved] = sourceItems.splice(sourceIndex, 1);

      if (sourceCol === destCol) {
        return {
          ...prev,
          [sourceCol]: arrayMove(sourceItems, sourceIndex, destIndex),
        };
      }

      destItems.splice(destIndex, 0, moved);

      return {
        ...prev,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
      };
    });
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div style={style.root}>
        {Object.keys(data).map((column) => (
          <div key={column} style={style.column}>
            <div style={style.header}>
              {column.replace("_", " ")}
              <span style={style.count}>{data[column].length}</span>
            </div>

            <SortableContext
              items={data[column].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={style.list}>
                {data[column].length === 0 && (
                  <div style={style.empty}>Drop task here</div>
                )}

                {data[column].map((task, index) => (
                  <div key={task.id} data-column={column} data-index={index}>
                    <Task id={task.id} title={task.title} />
                  </div>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default DragAndDrop;

/* ---------------- STYLES ---------------- */

const style = {
  root: {
    minHeight: "100vh",
    display: "flex",
    gap: 24,
    padding: 32,
    background: "linear-gradient(135deg,#0f172a,#020617)",
  },

  column: {
    flex: 1,
    background: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    color: "#e5e7eb",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: 12,
  },

  count: {
    background: "rgba(255,215,0,0.15)",
    color: "#FFD700",
    padding: "2px 10px",
    borderRadius: 999,
    fontSize: "0.7rem",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    minHeight: 120,
  },

  empty: {
    border: "2px dashed #475569",
    color: "#94a3b8",
    padding: 20,
    textAlign: "center",
    borderRadius: 12,
  },
};
