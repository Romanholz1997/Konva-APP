import React from "react";
import Sidebar from "./components/Canvas/Sidebar";
import Canvas from "./components/Canvas/Canvas";
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



// import React, { useEffect, useState } from "react";
// import { Stage, Layer, Rect, Circle } from "react-konva";

// interface ShapeProps {
//   type: "rectangle" | "circle";
//   x: number;
//   y: number;
//   width?: number; // For rectangle
//   height?: number; // For rectangle
//   radius?: number; // For circle
//   fill: string;
//   id: string;
// }

// const CANVAS_WIDTH = 800;
// const CANVAS_HEIGHT = 600;

// const initialRectangles: ShapeProps[] = [
//   {
//     type: "rectangle",
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: "#FF6B60",
//     id: "rect1",
//   },
//   {
//     type: "rectangle",
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: "#FF626B",
//     id: "rect2",
//   },
//   {
//     id: "circle1",
//     type: "circle",
//     x: 400,
//     y: 200,
//     fill: "#FF626B",
//     radius: 50,
//   },
// ];

// const App: React.FC = () => {
//   const [shapes, setShapes] = useState<ShapeProps[]>(initialRectangles);
//   const [selectedId, setSelectedId] = useState<string | null>(null);

//   // Move shape by key press
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!selectedId) return;

//       setShapes((prevShapes) => {
//         return prevShapes.map((shape) => {
//           if (shape.id !== selectedId) return shape;

//           // Calculate new position based on key
//           let newX = shape.x;
//           let newY = shape.y;

//           if (e.key === "ArrowLeft") newX -= 10;
//           if (e.key === "ArrowRight") newX += 10;
//           if (e.key === "ArrowUp") newY -= 10;
//           if (e.key === "ArrowDown") newY += 10;

//           // Boundary checks
//           if (shape.type === "rectangle") {
//             newX = Math.max(0, Math.min(CANVAS_WIDTH - (shape.width || 0), newX));
//             newY = Math.max(0, Math.min(CANVAS_HEIGHT - (shape.height || 0), newY));
//           } else if (shape.type === "circle") {
//             const radius = shape.radius || 0;
//             newX = Math.max(radius, Math.min(CANVAS_WIDTH - radius, newX));
//             newY = Math.max(radius, Math.min(CANVAS_HEIGHT - radius, newY));
//           }

//           // Collision detection
//           const isColliding = prevShapes.some(
//             (other) =>
//               other.id !== shape.id &&
//               isOverlap(
//                 { ...shape, x: newX, y: newY },
//                 other
//               )
//           );

//           if (isColliding) {
//             return shape; // Prevent movement
//           }

//           return { ...shape, x: newX, y: newY };
//         });
//       });
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [selectedId]);

//   // Helper: Collision detection
//   const isOverlap = (shape1: ShapeProps, shape2: ShapeProps): boolean => {
//     if (shape1.type === "rectangle" && shape2.type === "rectangle") {
//       return !(
//         shape1.x + (shape1.width || 0) <= shape2.x ||
//         shape2.x + (shape2.width || 0) <= shape1.x ||
//         shape1.y + (shape1.height || 0) <= shape2.y ||
//         shape2.y + (shape2.height || 0) <= shape1.y
//       );
//     }

//     if (shape1.type === "circle" && shape2.type === "circle") {
//       const dx = shape1.x - shape2.x;
//       const dy = shape1.y - shape2.y;
//       const distance = Math.sqrt(dx * dx + dy * dy);
//       return distance < (shape1.radius || 0) + (shape2.radius || 0);
//     }

//     if (shape1.type === "circle" && shape2.type === "rectangle") {
//       const closestX = Math.max(shape2.x, Math.min(shape1.x, shape2.x + (shape2.width || 0)));
//       const closestY = Math.max(shape2.y, Math.min(shape1.y, shape2.y + (shape2.height || 0)));
//       const dx = shape1.x - closestX;
//       const dy = shape1.y - closestY;
//       return dx * dx + dy * dy < (shape1.radius || 0) * (shape1.radius || 0);
//     }

//     if (shape1.type === "rectangle" && shape2.type === "circle") {
//       return isOverlap(shape2, shape1);
//     }

//     return false;
//   };

//   return (
//     <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
//       <Layer>
//         {shapes.map((shape) =>
//           shape.type === "rectangle" ? (
//             <Rect
//               key={shape.id}
//               x={shape.x}
//               y={shape.y}
//               width={shape.width}
//               height={shape.height}
//               fill={shape.fill}
//               onClick={() => setSelectedId(shape.id)}
//               stroke={selectedId === shape.id ? "black" : undefined}
//             />
//           ) : (
//             <Circle
//               key={shape.id}
//               x={shape.x}
//               y={shape.y}
//               radius={shape.radius}
//               fill={shape.fill}
//               onClick={() => setSelectedId(shape.id)}
//               stroke={selectedId === shape.id ? "black" : undefined}
//             />
//           )
//         )}
//       </Layer>
//     </Stage>
//   );
// };

// export default App;

