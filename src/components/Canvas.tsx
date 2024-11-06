// src/Canvas.tsx
import React from "react";
import { Stage, Layer, Rect } from "react-konva";
import Ruler from "./Ruler";

const Canvas: React.FC<{ selectedItem: string | null }> = ({
  selectedItem,
}) => {
  const rects = [
    { id: "Rect1", x: 50, y: 50, width: 100, height: 100 },
    { id: "Rect2", x: 200, y: 50, width: 100, height: 100 },
    // Add more rectangles as needed
  ];
  const rulerLength = 600; // Length of the rulers
  const tickSpacing = 20; // Spacing between ticks

  return (
    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Stage width={4000} height={4000}>
        <Layer>
          {rects.map((rect) => (
            <Rect
              key={rect.id}
              {...rect}
              fill={selectedItem === rect.id ? "blue" : "green"}
            />
          ))}
        </Layer>
        <Layer>
          {/* Horizontal Ruler */}
          <Ruler
            orientation="horizontal"
            length={rulerLength}
            tickSpacing={tickSpacing}
          />
          {/* Vertical Ruler */}
          <Ruler
            orientation="vertical"
            length={rulerLength}
            tickSpacing={tickSpacing}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
