// src/Sidebar.tsx
import React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSquare, faCircle } from "@fortawesome/free-solid-svg-icons";

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
  // const getIcon = (type: string) => {
  //   switch (type) {
  //     case "rectangle":
  //       return <FontAwesomeIcon icon={faSquare} color="blue" />;
  //     case "circle":
  //       return <FontAwesomeIcon icon={faCircle} color="blue" />;
  //     default:
  //       return null;
  //   }
  // };
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
      {/* {getIcon(shapeType)} */}
      {shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}{" "}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  return (
    <div style={{ width: "200px", border: "1px solid black", padding: "10px" }}>
      <DraggableItem shapeType="rectangle" onDragStart={onDragStart} />
      <DraggableItem shapeType="circle" onDragStart={onDragStart} />
      <DraggableItem shapeType="star" onDragStart={onDragStart} />
      <DraggableItem shapeType="Ellipse" onDragStart={onDragStart} />
      {/* <DraggableItem shapeType="circle" onDragStart={onDragStart} /> */}
    </div>
  );
};

export default Sidebar;
