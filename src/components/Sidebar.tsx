import React from "react";

interface SidebarProps {  
  isDrawRectangle: boolean;
  handleDrawRectangle: (newValue: boolean) => void;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    shapeType: string
  ) => void;
}

interface DraggableItemProps {
  shapeType: string;
  
  onDragStart: (e: React.DragEvent<HTMLDivElement>, shapeType: string) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  shapeType,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, shapeType)} // Pass event and shape type
      style={{
        padding: "10px",
        background: "lightgray",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}{" "}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onDragStart,  isDrawRectangle,
  handleDrawRectangle, }) => {
  return (
    <div style={{ width: "200px", border: "1px solid #bbb", padding: "10px" }}>
      <DraggableItem shapeType="rectangle" onDragStart={onDragStart} />
      <DraggableItem shapeType="circle" onDragStart={onDragStart} />
      <DraggableItem shapeType="star" onDragStart={onDragStart} />
      <DraggableItem shapeType="science" onDragStart={onDragStart} />
      <DraggableItem shapeType="text" onDragStart={onDragStart} />
      <div     
        style={{
          padding: "10px",
          background: "lightgray",
          marginBottom: "10px",
          display: "flex",
          cursor: "pointer",/* Change cursor on hover */
          transition: "background 0.3s", /* Smooth transition for background */
          alignItems: "center",          
        }}
        onClick={() => handleDrawRectangle(!isDrawRectangle)}
      >
        Draw Rectangle
      </div>
    </div>
  );
};

export default Sidebar;
