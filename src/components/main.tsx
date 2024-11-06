// src/Main.tsx
import React, { useState } from "react";
import { Stage, Layer, Rect, Circle, Star } from "react-konva";
import Ruler from "./Ruler";

const Main: React.FC = () => {
  const [shapes, setShapes] = useState<
    { id: number; x: number; y: number; type: string }[]
  >([]);
  const [nextId, setNextId] = useState(1);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const stage = target.closest(".konvajs-content")?.getBoundingClientRect();

    if (stage) {
      const x = e.clientX - stage.left;
      const y = e.clientY - stage.top;

      const shapeType = e.dataTransfer.getData("text/plain");

      const overlap = shapes.some((shape) => {
        return (
          x >= shape.x - 50 &&
          x <= shape.x + (shape.type === "rectangle" ? 50 : 0) &&
          y >= shape.y - 50 &&
          y <= shape.y + (shape.type === "rectangle" ? 50 : 0)
        );
      });

      if (!overlap) {
        setShapes([...shapes, { id: nextId, x, y, type: shapeType }]);
        setNextId(nextId + 1);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const rulerLength = 600; // Length of the rulers
  const tickSpacing = 20; // Spacing between ticks

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        width: "100vw ",
        height: "100vh",
        position: "relative",
      }} // Full window
    >
      <Stage width={window.innerWidth - 200} height={window.innerHeight}>
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === "rectangle") {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x - 50}
                  y={shape.y - 50}
                  width={100}
                  height={100}
                  fill="blue"
                />
                // <Rectangle
                //   key={shape.id} // Use rect.id as the key for better uniqueness
                //   shapeProps={rect}
                //   isSelected={rect.id === selectedId}
                //   onSelect={() => {}}
                //   onChange={() => {}}
                // />
              );
            } else if (shape.type === "circle") {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={25}
                  fill="red"
                />
              );
            } else if (shape.type === "star") {
              return (
                <Star
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  numPoints={5}
                  innerRadius={20}
                  outerRadius={40}
                  fill="green"
                />
              );
            }
            return null;
          })}
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

export default Main;
