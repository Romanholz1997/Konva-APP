import React from "react";

interface SidebarProps {
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

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  return (
    <div style={{ width: "200px", border: "1px solid #bbb", padding: "10px" }}>
      <DraggableItem shapeType="rectangle" onDragStart={onDragStart} />
      <DraggableItem shapeType="circle" onDragStart={onDragStart} />
      <DraggableItem shapeType="star" onDragStart={onDragStart} />
      <DraggableItem shapeType="science" onDragStart={onDragStart} />
      <DraggableItem shapeType="text" onDragStart={onDragStart} />
    </div>
  );
};

export default Sidebar;
