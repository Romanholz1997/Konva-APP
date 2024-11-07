// src/Main.tsx

import React, { useState, useCallback, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import Ruler from "./Ruler";
import { Shape, RectangleAttrs, CircleAttrs, StarAttrs } from "../types";
import Rectangle from "./Rectangle";
import CircleShape from "./Circle";
import StarShape from "./Star";
import useThrottle from "../hooks/useThrottle"; // Import the custom throttle hook

const Main: React.FC = () => {
  // State for shapes
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [selectedId, selectShape] = useState<number | null>(null);

  // State for Stage dimensions
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth - 200,
    height: window.innerHeight,
  });

  // State for messages and mouse position
  const [message, setMessage] = useState<string>("");
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Update Stage dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth - 200,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle drop event to add new shapes
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const target = e.target as HTMLElement;
      const stageElement = target.closest(".konvajs-content");

      if (!stageElement) return;

      const stageRect = stageElement.getBoundingClientRect();
      const x = e.clientX - stageRect.left;
      const y = e.clientY - stageRect.top;

      const shapeType = e.dataTransfer.getData("text/plain") as
        | "rectangle"
        | "circle"
        | "star";

      // Check for overlap with existing shapes
      const overlap = shapes.some((shape) => {
        switch (shape.type) {
          case "rectangle":
            return (
              x >= shape.x - shape.width / 2 &&
              x <= shape.x + shape.width / 2 &&
              y >= shape.y - shape.height / 2 &&
              y <= shape.y + shape.height / 2
            );
          case "circle":
            const dx = x - shape.x;
            const dy = y - shape.y;
            return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
          case "star":
            // Simple bounding box check for star
            return (
              x >= shape.x - shape.outerRadius &&
              x <= shape.x + shape.outerRadius &&
              y >= shape.y - shape.outerRadius &&
              y <= shape.y + shape.outerRadius
            );
          default:
            return false;
        }
      });

      if (!overlap) {
        let newShape: Shape;
        switch (shapeType) {
          case "rectangle":
            newShape = {
              id: nextId,
              type: "rectangle",
              x: x,
              y: y,
              width: 100,
              height: 100,
              fill: "blue",
              rotation: 0,
            };
            break;
          case "circle":
            newShape = {
              id: nextId,
              type: "circle",
              x: x,
              y: y,
              radius: 50,
              fill: "red",
            };
            break;
          case "star":
            newShape = {
              id: nextId,
              type: "star",
              x: x,
              y: y,
              numPoints: 5,
              innerRadius: 20,
              outerRadius: 40,
              fill: "green",
              rotation: 0, // Initialize rotation
            };
            break;
          default:
            return;
        }

        setShapes([...shapes, newShape]);
        setNextId(nextId + 1);
      }
    },
    [shapes, nextId]
  );

  // Prevent default behavior for drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handlers for Free Area with throttling
  const throttledMouseMove = useThrottle((e: any) => {
    const stage = e.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (pointer) {
      setMousePosition(pointer);
    }
  }, 100); // Throttle delay in milliseconds

  const handleBackgroundMouseMove = useCallback(
    (e: any) => {
      throttledMouseMove(e);
    },
    [throttledMouseMove]
  );

  // Remember to cancel the throttle on unmount is handled inside the hook

  const handleBackgroundMouseDown = (e: any) => {
    setMessage("You clicked");
    selectShape(null); // Deselect any selected shape
  };

  const handleBackgroundMouseUp = (e: any) => {
    // Optional: Handle mouse up if needed
  };

  const tickSpacing = 20; // Spacing between ticks

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
      }} // Full window
    >
      <Stage width={dimensions.width} height={dimensions.height}>
        {/* Background Layer */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="transparent"
            onMouseDown={handleBackgroundMouseDown}
            onMouseMove={handleBackgroundMouseMove}
            onMouseUp={handleBackgroundMouseUp}
          />
        </Layer>

        {/* Rulers Layer */}
        <Layer>
          {/* Horizontal Ruler */}
          <Ruler
            orientation="horizontal"
            length={dimensions.width}
            tickSpacing={tickSpacing}
          />
          {/* Vertical Ruler */}
          <Ruler
            orientation="vertical"
            length={dimensions.height}
            tickSpacing={tickSpacing}
          />
        </Layer>

        {/* Shapes Layer */}
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === "rectangle") {
              const rect = shape as RectangleAttrs;

              return (
                <Rectangle
                  key={rect.id}
                  shapeProps={rect}
                  isSelected={rect.id === selectedId}
                  onSelect={() => {
                    selectShape(rect.id);
                    setMessage(""); // Clear background message
                  }}
                  onChange={(newAttrs: RectangleAttrs) => {
                    const updatedShapes = shapes.map((s) =>
                      s.id === rect.id ? { ...s, ...newAttrs } : s
                    );
                    setShapes(updatedShapes);
                  }}
                />
              );
            } else if (shape.type === "circle") {
              const circle = shape as CircleAttrs;

              return (
                <CircleShape
                  key={circle.id}
                  shapeProps={circle}
                  isSelected={circle.id === selectedId}
                  onSelect={() => {
                    selectShape(circle.id);
                    setMessage("");
                  }}
                  onChange={(newAttrs: CircleAttrs) => {
                    const updatedShapes = shapes.map((s) =>
                      s.id === circle.id ? { ...s, ...newAttrs } : s
                    );
                    setShapes(updatedShapes);
                  }}
                />
              );
            } else if (shape.type === "star") {
              const star = shape as StarAttrs;

              return (
                <StarShape
                  key={star.id}
                  shapeProps={star}
                  isSelected={star.id === selectedId}
                  onSelect={() => {
                    selectShape(star.id);
                    setMessage("");
                  }}
                  onChange={(newAttrs: StarAttrs) => {
                    const updatedShapes = shapes.map((s) =>
                      s.id === star.id ? { ...s, ...newAttrs } : s
                    );
                    setShapes(updatedShapes);
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Mouse Position Label */}
      {mousePosition && !selectedId && (
        <div
          style={{
            position: "absolute",
            left: Math.min(mousePosition.x + 10, dimensions.width - 50), // Prevent overflow on the right
            top: Math.max(mousePosition.y - 20, 0), // Prevent overflow on the top
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "2px 5px",
            borderRadius: "3px",
            pointerEvents: "none", // Allows clicks to pass through
            fontSize: "12px",
            whiteSpace: "nowrap",
            transform: "translate(-50%, -100%)", // Center horizontally and position above
            boxShadow: "0 0 3px rgba(0,0,0,0.5)",
          }}
        >
          {`(${mousePosition.x.toFixed(0)}, ${mousePosition.y.toFixed(0)})`}
        </div>
      )}

      {/* Message Display */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "rgba(255, 255, 255, 0.8)",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
        }}
      >
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Main;
