import React from "react";
import Sidebar from "./components/Sidebar";
import Canvas from "./components/Canvas";

const App: React.FC = () => {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    shapeType: string
  ) => {
    const dataTransfer = e.dataTransfer; 
    if (dataTransfer) {
      dataTransfer.setData("text/plain", shapeType);
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
