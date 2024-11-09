import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Transformer,
  Text,
  Line,
} from "react-konva";
import Konva from "konva";
import Ruler from "./Ruler";
import {
  Shape,
  RectangleAttrs,
  StarAttrs,
  CircleAttrs,
} from "../../types/types";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Star from "./Star";

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;
const Canvas: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  const [showMouseInfo, setShowMouseInfo] = useState(false);
  const [mouseMessage, setMouseMessage] = useState<string>("");

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);

  // Load the background image
  useEffect(() => {
    const imagePath = "./background.svg"; // Replace with your SVG path
    loadBackgroundImage(imagePath);
  }, []);

  const loadBackgroundImage = (src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setBackgroundImage(img);
    };
    img.onerror = (err) => {
      console.error("Failed to load background image:", err);
    };
  };
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect shapes if clicked on empty area
    if (e.target === stageRef.current) {
      setSelectedIds([]);
      const pos = stageRef.current?.getPointerPosition();
      if (pos) {
        setSelectionRect({
          visible: true,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
        });
        setIsSelecting(true);
      }
      if (e.evt.ctrlKey) {
        setMouseMessage(`Ctrl clicked in the free area`);
      } else {
        setMouseMessage("You clicked in the free area");
        // selectShape(null);
      }
    }
  };
  const handleScroll = () => {
    if (canvasRef.current) {
      setScrollOffsetX(canvasRef.current.scrollLeft);
      setScrollOffsetY(canvasRef.current.scrollTop);
    }
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("scroll", handleScroll);
      return () => {
        canvas.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();

    const pos = stageRef.current?.getPointerPosition();
    if (pos) {
      setMouseCoords({ x: pos.x, y: pos.y });
      if (e.target === stageRef.current) {
        setShowMouseInfo(true);
        setMouseMessage(`Mouse move in free area`);
      } else {
        setShowMouseInfo(false);
      }
      if (!isSelecting) {
        return;
      }
    }

    if (pos && selectionRect.visible) {
      const x = Math.min(pos.x, selectionRect.x);
      const y = Math.min(pos.y, selectionRect.y);
      const width = Math.abs(pos.x - selectionRect.x);
      const height = Math.abs(pos.y - selectionRect.y);
      setSelectionRect({
        ...selectionRect,
        x,
        y,
        width,
        height,
      });
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionRect({
        ...selectionRect,
        visible: false,
      });

      const selBox = selectionRect;
      const selected = shapes.filter((shape) => {
        const shapeNode = layerRef.current?.findOne<Konva.Rect>(`#${shape.id}`);
        if (shapeNode) {
          return Konva.Util.haveIntersection(selBox, shapeNode.getClientRect());
        }
        return false;
      });

      setSelectedIds(selected.map((shape) => shape.id));
    }
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    if (transformer) {
      const nodes = selectedIds
        .map((id) => layerRef.current?.findOne<Konva.Rect>(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      transformer.nodes(nodes);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  const handleShapeClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    id: string
  ) => {
    e.cancelBubble = true;

    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = selectedIds.includes(id);

    if (!metaPressed && !isSelected) {
      setSelectedIds([id]);
    } else if (metaPressed && isSelected) {
      setSelectedIds(selectedIds.filter((_id) => _id !== id));
    } else if (metaPressed && !isSelected) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const transformedNodes = transformer.nodes();

    const newShapes = shapes.map((shape) => {
      const node = transformedNodes.find((n) => n.id() === String(shape.id));
      if (node) {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const rotation = node.rotation();

        // Reset scale to 1
        node.scaleX(1);
        node.scaleY(1);

        if (shape.type === "rectangle") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          };
        } else if (shape.type === "circle") {
          const avgScale = (scaleX + scaleY) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            radius: Math.max(5, shape.radius * avgScale),
          };
        } else if (shape.type === "star") {
          const avgScale = (scaleX + scaleY) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            innerRadius: Math.max(5, shape.innerRadius * avgScale),
            outerRadius: Math.max(5, shape.outerRadius * avgScale),
          };
        } else {
          return shape;
        }
      } else {
        return shape;
      }
    });

    setShapes(newShapes);
  };

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
              id: "rectangle_" + nextId,
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
              id: "circle_" + nextId,
              type: "circle",
              x: x,
              y: y,
              radius: 50,
              fill: "red",
              rotation: 0,
            };
            break;
          case "star":
            newShape = {
              id: "star_" + nextId,
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
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const newShapes = shapes.map((shape) => {
      if (shape.id === id) {
        return {
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        };
      }
      return shape;
    });
    setShapes(newShapes);
  };
  const handleTopRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll horizontally based on wheel delta
      canvasRef.current.scrollLeft += e.deltaY;
    }
  };
  const handleLeftRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll vertically based on wheel delta
      canvasRef.current.scrollTop += e.deltaY;
    }
  };
  const deleteSelectedShapes = () => {
    if (selectedIds.length > 0) {
      // Filter out the selected shapes
      const newShapes = shapes.filter(
        (shape) => !selectedIds.includes(shape.id)
      );

      // Update the shapes state
      setShapes(newShapes);

      // Clear the selectedIds
      setSelectedIds([]);
    }
  };

  // Add a useEffect hook to handle keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Call the function to delete selected shapes
        deleteSelectedShapes();
      }
    };

    // Add event listener to the window object
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds, shapes]);

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
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              deleteSelectedShapes();
            }
          }}
        >
          <Layer>
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                x={0}
                y={0}
                listening={false}
              />
            )}
          </Layer>
          <Layer ref={layerRef}>
            {shapes.map((shape) => {
              if (shape.type === "rectangle") {
                const rect = shape as RectangleAttrs;
                return (
                  <Rectangle
                    key={rect.id}
                    id={rect.id}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    fill={rect.fill}
                    rotation={rect.rotation}
                    onShapeClick={(e) => handleShapeClick(e, rect.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, rect.id)}
                  />
                );
              } else if (shape.type === "circle") {
                const circle = shape as CircleAttrs;

                return (
                  <Circle
                    key={circle.id}
                    id={circle.id}
                    x={circle.x}
                    y={circle.y}
                    radius={circle.radius}
                    fill={circle.fill}
                    rotation={circle.rotation}
                    onShapeClick={(e) => handleShapeClick(e, circle.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, circle.id)}
                  />
                );
              } else if (shape.type === "star") {
                const star = shape as StarAttrs;

                return (
                  <Star
                    key={star.id}
                    id={star.id}
                    x={star.x}
                    y={star.y}
                    numPoints={star.numPoints}
                    innerRadius={star.innerRadius}
                    outerRadius={star.outerRadius}
                    fill={star.fill}
                    rotation={star.rotation}
                    onShapeClick={(e) => handleShapeClick(e, star.id)}
                    // Remove onTransformEnd from individual shapes
                    onDragEnd={(e) => handleDragEnd(e, star.id)}
                  />
                );
              }
              return null;
            })}

            {/* Transformer */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              enabledAnchors={[
                "top-left",
                "top-right",
                "bottom-left",
                "bottom-right",
                "middle-left",
                "middle-right",
                "top-center",
                "bottom-center",
              ]}
              onTransformEnd={handleTransformEnd} // Attach handler here
            />

            {/* Selection Rectangle */}
            {selectionRect.visible && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                fill="rgba(0, 0, 255, 0.2)"
                listening={false}
              />
            )}
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
      </div>
    </div>
  );
};

export default Canvas;
