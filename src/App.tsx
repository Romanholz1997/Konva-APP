import React from "react";
import Sidebar from "./components/Canvas/Sidebar";
import Canvas from "./components/Canvas/Canvas";
import Select from "./components/Canvas/Select";
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

// import React, { useRef, useState, useEffect } from 'react';
// import { Stage, Layer, Rect,  Circle, Path, Line, Image as KonvaImage } from 'react-konva';
// import Konva from 'konva';

// interface SVGImageProps {
//   imageElement: Element;
// }

// const getRotation = (element: Element): number => {
//   const transform = element.getAttribute('transform');
//   if (transform) {
//     const match = transform.match(/rotate\(([^)]+)\)/);
//     if (match) {
//       const params = match[1].split(',').map(Number);
//       return params[0]; // Rotation angle
//     }
//   }
//   return 0;
// };

// const SVGImage: React.FC<SVGImageProps> = ({ imageElement }) => {
//   const [loadedImage, setLoadedImage] = useState<HTMLImageElement | undefined>(undefined);

//   useEffect(() => {
//     const href =
//       imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href') || '';
//     if (href) {
//       const img = new window.Image();
//       img.crossOrigin = 'Anonymous';
//       img.src = href;

//       img.onload = () => {
//         setLoadedImage(img);
//       };

//       img.onerror = () => {
//         console.error(`Failed to load image at ${href}`);
//       };
//     }
//   }, [imageElement]);

//   if (!loadedImage) {
//     return null; // Or render a placeholder
//   }

//   const x = parseFloat(imageElement.getAttribute('x') || '0');
//   const y = parseFloat(imageElement.getAttribute('y') || '0');
//   const width = parseFloat(imageElement.getAttribute('width') || '0');
//   const height = parseFloat(imageElement.getAttribute('height') || '0');
//   const rotation = getRotation(imageElement);

//   return (
//     <KonvaImage
//       image={loadedImage}
//       x={x}
//       y={y}
//       width={width}
//       height={height}
//       rotation={rotation}
//     />
//   );
// };
// const App: React.FC = () => {
//   const stageRef = useRef<Konva.Stage>(null);
//   const [svgContent, setSvgContent] = useState<string | null>(null);
//   const [konvaShapes, setKonvaShapes] = useState<JSX.Element[]>([]);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && file.type === 'image/svg+xml') {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSvgContent(e.target?.result as string);
//       };
//       reader.readAsText(file);
//     } else {
//       alert('Please upload a valid SVG file.');
//     }
//   };
//   const getRotation = (element: Element): number => {
//     const transform = element.getAttribute('transform');
//     if (transform) {
//       const match = transform.match(/rotate\(([^)]+)\)/);
//       if (match) {
//         const params = match[1].split(',').map(Number);
//         return params[0]; // Rotation angle
//       }
//     }
//     return 0;
//   };
//   useEffect(() => {
//     if (svgContent) {
//       const parser = new DOMParser();
//       const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
//       const newShapes: JSX.Element[] = [];

//       // Handle <rect> elements
//       const rectElements = svgDoc.getElementsByTagName('rect');
//       for (let i = 0; i < rectElements.length; i++) {
//         const rect = rectElements[i];
//         const x = parseFloat(rect.getAttribute('x') || '0');
//         const y = parseFloat(rect.getAttribute('y') || '0');
//         const width = parseFloat(rect.getAttribute('width') || '0');
//         const height = parseFloat(rect.getAttribute('height') || '0');
//         const fill = rect.getAttribute('fill') || 'black';
//         const rotation = getRotation(rect);
//         newShapes.push(
//           <Rect
//             key={`rect-${i}`}
//             x={x}
//             y={y}
//             width={width}
//             height={height}
//             fill={fill}
//             rotation={rotation}
//             draggable
//           />
//         );
//       }

//       // Handle <circle> elements
//       const circleElements = svgDoc.getElementsByTagName('circle');
//       for (let i = 0; i < circleElements.length; i++) {
//         const circle = circleElements[i];
//         const cx = parseFloat(circle.getAttribute('cx') || '0');
//         const cy = parseFloat(circle.getAttribute('cy') || '0');
//         const r = parseFloat(circle.getAttribute('r') || '0');
//         const fill = circle.getAttribute('fill') || 'black';
//         newShapes.push(
//           <Circle
//             key={`circle-${i}`}
//             x={cx}
//             y={cy}
//             radius={r}
//             fill={fill}
//           />
//         );
//       }

//       const imageElements = svgDoc.getElementsByTagName('image');
//       for (let i = 0; i < imageElements.length; i++) {
//         const imageElement = imageElements[i];
//         newShapes.push(
//           <SVGImage key={`image-${i}`} imageElement={imageElement} />
//         );
//       }

//     const polygonElements = svgDoc.getElementsByTagName('polygon');
//     for (let i = 0; i < polygonElements.length; i++) {
//       const polygon = polygonElements[i];
//       const pointsAttr = polygon.getAttribute('points') || '';
//       const fill = polygon.getAttribute('fill') || 'black';
//       const rotation = getRotation(polygon);

//       // Convert points string to an array of numbers
//       const points = pointsAttr
//         .trim()
//         .split(/\s+|,/)
//         .map((coord) => parseFloat(coord));

//       newShapes.push(
//         <Line
//           key={`polygon-${i}`}
//           points={points}
//           fill={fill}
//           closed={true}
//           rotation={rotation}
//         />
//       );
//     }

//       // Handle <path> elements
//       const pathElements = svgDoc.getElementsByTagName('path');
//       for (let i = 0; i < pathElements.length; i++) {
//         const path = pathElements[i];
//         const d = path.getAttribute('d') || '';
//         const fill = path.getAttribute('fill') || 'black';

//         newShapes.push(
//           <Path key={`path-${i}`} data={d} fill={fill} />
//         );
//       }

//       setKonvaShapes(newShapes);
//     }
//   }, [svgContent]);

//   return (
//     <div>
//       <input type="file" accept=".svg" onChange={handleFileChange} />

//       <Stage
//         ref={stageRef}
//         width={4000}
//         height={4000}
//       >
//         <Layer>{konvaShapes}</Layer>
//       </Stage>
//     </div>
//   );
// };

// export default App;

// import React, { useRef, useState, ChangeEvent } from 'react';
// import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
// import { saveAs } from 'file-saver';

// interface ShapeData {
//   type: 'rect' | 'circle' | 'text';
//   x: number;
//   y: number;
//   width?: number;
//   height?: number;
//   radius?: number;
//   fill?: string;
//   text?: string;
//   fontSize?: number;
// }

// const App: React.FC = () => {
//   const stageRef = useRef<any>(null);
//   const [svgContent, setSvgContent] = useState<string | null>(null);

//   const shapesData: ShapeData[] = [
//     { type: 'rect', x: 50, y: 50, width: 100, height: 100, fill: 'red' },
//     { type: 'circle', x: 200, y: 200, radius: 50, fill: 'green' },
//     { type: 'text', x: 300, y: 300, text: 'Hello', fontSize: 30, fill: 'blue' },
//   ];

//   // Function to save layout as SVG
//   const saveAsSVG = () => {
//     if (stageRef.current) {
//       const svgString = `
//         <svg xmlns="http://www.w3.org/2000/svg" width="${stageRef.current.width()}px" height="${stageRef.current.height()}px">
//           ${shapesData.map(shape => {
//             switch (shape.type) {
//               case 'rect':
//                 return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" />`;
//               case 'circle':
//                 return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" fill="${shape.fill}" />`;
//               case 'text':
//                 return `<text x="${shape.x}" y="${shape.y}" font-size="${shape.fontSize}" fill="${shape.fill}">${shape.text}</text>`;
//               default:
//                 return '';
//             }
//           }).join('')}
//         </svg>
//       `;
//       const blob = new Blob([svgString], { type: 'image/svg+xml' });
//       saveAs(blob, 'layout.svg');
//     }
//   };

//   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file && file.type === 'image/svg+xml') {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSvgContent(e.target?.result as string);
//       };
//       reader.readAsText(file);
//     } else {
//       alert('Please upload a valid SVG file.');
//     }
//   };

//   return (
//     <div>
//       <button onClick={saveAsSVG}>Save as SVG</button>
//       <input type="file" accept=".svg" onChange={handleFileChange} />
//       {svgContent && (
//         <div>
//           <h3>Uploaded SVG</h3>
//           <div dangerouslySetInnerHTML={{ __html: svgContent }} />
//         </div>
//       )}
//       <Stage ref={stageRef} width={window.innerWidth} height={window.innerHeight}>
//         <Layer>
//           {shapesData.map((shape, index) => {
//             switch (shape.type) {
//               case 'rect':
//                 return (
//                   <Rect
//                     key={index}
//                     x={shape.x}
//                     y={shape.y}
//                     width={shape.width}
//                     height={shape.height}
//                     fill={shape.fill}
//                     draggable
//                   />
//                 );
//               case 'circle':
//                 return (
//                   <Circle
//                     key={index}
//                     x={shape.x}
//                     y={shape.y}
//                     radius={shape.radius}
//                     fill={shape.fill}
//                     draggable
//                   />
//                 );
//               case 'text':
//                 return (
//                   <Text
//                     key={index}
//                     x={shape.x}
//                     y={shape.y}
//                     text={shape.text}
//                     fontSize={shape.fontSize}
//                     fill={shape.fill}
//                   />
//                 );
//               default:
//                 return null;
//             }
//           })}
//         </Layer>
//       </Stage>
//     </div>
//   );
// };

// export default App;
