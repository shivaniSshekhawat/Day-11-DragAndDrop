import DragAndDrop from "./DragAndDrop";

const App = () => {
  const taskData = {
    BACKLOG: [
      { id: 1, title: "Design login page" },
      { id: 2, title: "Create API contract" },
      { id: 3, title: "Define user roles & permissions" },
    ],

    IN_PROGRESS: [
      { id: 4, title: "Implement authentication" },
      { id: 5, title: "Build dashboard layout" },
    ],

    REVIEW: [
      { id: 6, title: "Review API integration" },
      { id: 7, title: "UI consistency check" },
    ],

    DONE: [
      { id: 8, title: "Project setup & repo init" },
      { id: 9, title: "Development environment ready" },
    ],
  };

  return (
    <>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Work Board</h1>
        <p style={subtitleStyle}>Drag and organize your tasks effortlessly</p>
      </header>

      <DragAndDrop data={taskData} />
    </>
  );
};

export default App;

/* ---------- Header Styles ---------- */

const headerStyle = {
  padding: "32px",
  paddingBottom: "16px",
  background: "linear-gradient(135deg, #020617, #0f172a)",
};

const titleStyle = {
  color: "#f8fafc",
  fontSize: "2.2rem",
  fontWeight: 700,
  margin: 0,
};

const subtitleStyle = {
  color: "#94a3b8",
  marginTop: "6px",
  fontSize: "0.95rem",
};
