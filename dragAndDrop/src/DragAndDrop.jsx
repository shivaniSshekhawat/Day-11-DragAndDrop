import { useEffect, useState } from "react";

/* ================= TASK CARD ================= */

function Task({ task, onDragStart, onDrop }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={(e) => e.preventDefault()} // Allow dropping on tasks for reordering
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent column drop
        onDrop(e, task.id);
      }}
      style={{
        background: "linear-gradient(145deg,#111827,#020617)",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        cursor: "grab",
        color: "#f9fafb",
        boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
      }}
    >
      <p style={{ marginBottom: 6, fontSize: "0.9rem", margin: 0 }}>
        {task.title}
      </p>
      <div style={{ marginTop: 8 }}>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#fff",
            background: "linear-gradient(90deg,#38bdf8,#6366f1)",
            padding: "2px 10px",
            borderRadius: 999,
          }}
        >
          TASK
        </span>
      </div>
    </div>
  );
}

/* ================= COLUMN ================= */

function Column({ id, title, tasks, color, onDrop, onDragOver, onDragStartTask, onDropTask }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, id)}
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(18px)",
        borderRadius: 18,
        padding: 16,
        borderTop: `4px solid ${color}`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#e5e7eb",
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {title}
        <span
          style={{
            background: "rgba(255,215,0,0.15)",
            color: "#FFD700",
            padding: "2px 10px",
            borderRadius: 999,
            fontSize: "0.7rem",
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        {tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onDragStart={onDragStartTask}
            onDrop={onDropTask}
          />
        ))}

        {tasks.length === 0 && (
          <div
            style={{
              marginTop: 16,
              border: "2px dashed rgba(255,255,255,0.2)",
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.85rem",
              pointerEvents: "none", // Let drop pass through to column
            }}
          >
            Drop task here
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= BOARD ================= */

export default function DragAndDrop({ data: initialData }) {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("tasks-data");
    return saved ? JSON.parse(saved) : initialData;
  });

  useEffect(() => {
    localStorage.setItem("tasks-data", JSON.stringify(data));
  }, [data]);

  const columnColors = {
    BACKLOG: "#38bdf8",
    IN_PROGRESS: "#facc15",
    REVIEW: "#a78bfa",
    DONE: "#22c55e",
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const findColumn = (taskId) => {
    return Object.keys(data).find((col) =>
      data[col].some((t) => t.id === taskId)
    );
  };

  // Dropping on the Column (background)
  const handleColumnDrop = (e, destColId) => {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData("taskId"));
    if (!taskId) return;

    const sourceColId = findColumn(taskId);
    if (!sourceColId) return;

    // Logic: Remove from source, push to destination end
    setData((prev) => {
      const sourceList = [...prev[sourceColId]];
      const destList = sourceColId === destColId ? sourceList : [...prev[destColId]];

      const taskIndex = sourceList.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const [movedTask] = sourceList.splice(taskIndex, 1);
      
      // If dropping on column, we append to the end. 
      // Note: If source == dest, this just moves to end.
      destList.push(movedTask);

      return {
        ...prev,
        [sourceColId]: sourceList,
        [destColId]: destList,
      };
    });
  };

  // Dropping on a Task (Reordering)
  const handleTaskDrop = (e, targetTaskId) => {
    e.preventDefault();
    const draggedTaskId = Number(e.dataTransfer.getData("taskId"));
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;

    const sourceColId = findColumn(draggedTaskId);
    const destColId = findColumn(targetTaskId);

    if (!sourceColId || !destColId) return;

    setData((prev) => {
      const sourceList = [...prev[sourceColId]];
      const destList = sourceColId === destColId ? sourceList : [...prev[destColId]];

      const dragIndex = sourceList.findIndex((t) => t.id === draggedTaskId);
      const dropIndex = destList.findIndex((t) => t.id === targetTaskId);

      if (dragIndex === -1 || dropIndex === -1) return prev;

      const [movedTask] = sourceList.splice(dragIndex, 1);
      
      // Insert before the target task
      // Note: if same list, we need to adjust dropIndex if we removed from before it
      // But splice mutates sourceList defined above. 
      // If source === dest, sourceList IS destList (ref checked above? No, we used ternary to assign/copy).
      
      // WAIT: In the ternary `const destList = sourceColId === destColId ? sourceList : [...prev[destColId]];`
      // destList IS sourceList reference if columns check out.
      // So sourceList.splice affects destList.
      // We just need to find the NEW index of targetTaskId?
      
      let finalDropIndex = dropIndex;
      // If same column and we dragged from above the drop target, the drop target index shifted down by 1.
      // Actually, if we remove index 0, index 5 becomes 4.
      // So we need to re-find index?
      if (sourceColId === destColId) {
         finalDropIndex = destList.findIndex((t) => t.id === targetTaskId);
      }

      destList.splice(finalDropIndex, 0, movedTask);

      return {
        ...prev,
        [sourceColId]: sourceList,
        [destColId]: destList,
      };
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        gap: 24,
        padding: 32,
        background: "linear-gradient(135deg,#0f172a,#020617)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {Object.keys(data).map((columnId) => (
        <Column
          key={columnId}
          id={columnId}
          title={columnId.replace("_", " ")}
          tasks={data[columnId]}
          color={columnColors[columnId]}
          onDragOver={handleDragOver}
          onDrop={handleColumnDrop}
          onDragStartTask={handleDragStart}
          onDropTask={handleTaskDrop}
        />
      ))}
    </div>
  );
}
