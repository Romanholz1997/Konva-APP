// src/DraggableList.tsx
import React, { useState } from "react";

const DraggableList: React.FC<{ onItemSelect: (item: string) => void }> = ({
  onItemSelect,
}) => {
  const items = Array.from({ length: 15 }, (_, i) => `Rect${i + 1}`);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelect = (item: string) => {
    setSelectedItem(item);
    onItemSelect(item);
  };

  return (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {items.map((item) => (
        <li
          key={item}
          onClick={() => handleSelect(item)}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", item);
          }}
          style={{
            padding: "8px",
            margin: "4px 0",
            backgroundColor: selectedItem === item ? "#d3d3d3" : "#f0f0f0",
            cursor: "grab",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

export default DraggableList;
