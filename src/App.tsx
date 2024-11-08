import React from "react";
import Sidebar from "./components/Canvas/Sidebar";
import Canvas from "./components/Canvas/Canvas";

const App: React.FC = () => {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    shapeType: string
  ) => {
    const dataTransfer = e.dataTransfer; // Use the event object to get dataTransfer
    if (dataTransfer) {
      dataTransfer.setData("text/plain", shapeType); // Set shape type
    }
  };
  return (
    <div style={{ display: "flex" }}>
      <Sidebar onDragStart={handleDragStart} />
      <Canvas />
    </div>
  );
};

export default App;
