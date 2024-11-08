// src/Main.tsx

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Line } from "react-konva";
import Konva from "konva";
import Ruler from "./Ruler";
import {
  Shape,
  RectangleAttrs,
  CircleAttrs,
  StarAttrs,
} from "../../types/types";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Star from "./Star";
import "./custom.css";

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;
const Canvas: React.FC = () => {
  // State for shapes
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [mouseMessage, setMouseMessage] = useState<string>("");
  const [selectedId, selectShape] = useState<number | null>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showMouseInfo, setShowMouseInfo] = useState(false);
  // Handle scrolling and update ruler offsets
  const handleScroll = () => {
    if (canvasRef.current) {
      setScrollOffsetX(canvasRef.current.scrollLeft);
      setScrollOffsetY(canvasRef.current.scrollTop);
    }
  };
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const shape = e.target;
    const stage = stageRef.current;
    if (!stage) return;

    const canvasWidth = stage.width();
    const canvasHeight = stage.height();

    // Ensure shapes stay within canvas boundaries
    const newX = Math.max(0, Math.min(shape.x(), canvasWidth - shape.width()));
    const newY = Math.max(
      0,
      Math.min(shape.y(), canvasHeight - shape.height())
    );

    shape.x(newX);
    shape.y(newY);
  };
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

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pointerPos = stageRef.current?.getPointerPosition();
    if (pointerPos) {
      setMouseCoords({ x: pointerPos.x, y: pointerPos.y });

      // Only show mouse information if the cursor is in the free area
      if (e.target === stageRef.current) {
        setShowMouseInfo(true);
        setMouseMessage(`Mouse move in free area`);
      } else {
        setShowMouseInfo(false);
      }
    }
  };
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) {
      if (e.evt.ctrlKey) {
        setMouseMessage(`Ctrl clicked in the free area`);
      } else {
        setIsSelecting(true);
        setMouseMessage("You clicked in the free area");
        selectShape(null);
      }
    }
  };
  useEffect(() => {
    if (selectedId !== null) {
      setMouseMessage(`Shape ${selectedId} selected`);
    }
  }, [selectedId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("scroll", handleScroll);
      return () => {
        canvas.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleTopRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (canvasRef.current) {
      // Scroll horizontally based on wheel delta
      canvasRef.current.scrollLeft += e.deltaY;
    }
  };

  // Handle wheel events on the left ruler (vertical scrolling)
  const handleLeftRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (canvasRef.current) {
      // Scroll vertically based on wheel delta
      canvasRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div className="container">
      <Ruler
        handleTopRulerWheel={handleTopRulerWheel}
        handleLeftRulerWheel={handleLeftRulerWheel}
        scrollOffsetX={scrollOffsetX}
        scrollOffsetY={scrollOffsetY}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="canvas-container"
        ref={canvasRef}
      >
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          draggable
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          onDragMove={(e) => {
            if (dragging && stageRef.current) {
              const stage = stageRef.current;
              const newPos = stage.position();
              // Constrain the panning within the canvas area
              stage.position({
                x: Math.max(
                  Math.min(newPos.x, 0),
                  -(CANVAS_WIDTH - stage.width())
                ),
                y: Math.max(
                  Math.min(newPos.y, 0),
                  -(CANVAS_HEIGHT - stage.height())
                ),
              });
            }
          }}
        >
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
                    }}
                    onChange={(newAttrs: RectangleAttrs) => {
                      const updatedShapes = shapes.map((s) =>
                        s.id === rect.id ? { ...s, ...newAttrs } : s
                      );
                      setShapes(updatedShapes);
                    }}
                    onDragMove={handleDragMove}
                  />
                );
              } else if (shape.type === "circle") {
                const circle = shape as CircleAttrs;

                return (
                  <Circle
                    key={circle.id}
                    shapeProps={circle}
                    isSelected={circle.id === selectedId}
                    onSelect={() => {
                      selectShape(circle.id);
                    }}
                    onChange={(newAttrs: CircleAttrs) => {
                      const updatedShapes = shapes.map((s) =>
                        s.id === circle.id ? { ...s, ...newAttrs } : s
                      );
                      setShapes(updatedShapes);
                    }}
                    onDragMove={handleDragMove}
                  />
                );
              } else if (shape.type === "star") {
                const star = shape as StarAttrs;

                return (
                  <Star
                    key={star.id}
                    shapeProps={star}
                    isSelected={star.id === selectedId}
                    onSelect={() => {
                      selectShape(star.id);
                    }}
                    onChange={(newAttrs: StarAttrs) => {
                      const updatedShapes = shapes.map((s) =>
                        s.id === star.id ? { ...s, ...newAttrs } : s
                      );
                      setShapes(updatedShapes);
                    }}
                    onDragMove={handleDragMove}
                  />
                );
              }
              return null;
            })}
            {showMouseInfo && (
              <>
                {/* Display Mouse Coordinates */}
                <Text
                  x={mouseCoords.x + 5}
                  y={mouseCoords.y - 15} // 10px above the cursor
                  text={`(${mouseCoords.x}, ${mouseCoords.y})`}
                  fontSize={12}
                  fill="black"
                />
                {/* Crosshair Lines */}
                <Line
                  points={[0, mouseCoords.y, CANVAS_WIDTH, mouseCoords.y]} // Horizontal line
                  stroke="black"
                  strokeWidth={1}
                />
                <Line
                  points={[mouseCoords.x, 0, mouseCoords.x, CANVAS_HEIGHT]} // Vertical line
                  stroke="black"
                  strokeWidth={1}
                />
              </>
            )}
          </Layer>
        </Stage>
      </div>
      {/* Message Display */}
      <div
        style={{
          position: "absolute",
          top: 35,
          right: 10,
          background: "rgba(255, 255, 255, 0.8)",
          padding: "0px",
          paddingRight: "10px",
          paddingLeft: "10px",
          borderRadius: "5px",
          boxShadow: "0 0 5px rgba(0,0,0,0.3)",
        }}
      >
        {showMouseInfo && <p>{mouseMessage}</p>}
        {selectedId && !showMouseInfo && <p>{mouseMessage}</p>}
      </div>
    </div>
  );
};

export default Canvas;
