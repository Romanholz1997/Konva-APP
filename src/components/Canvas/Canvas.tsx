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
import { saveAs } from 'file-saver';
import { KonvaEventObject } from "konva/lib/Node";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Ruler from "./Ruler";
import {
  Shape,
  RectangleAttrs,
  StarAttrs,
  CircleAttrs,
  SVGAttrs
} from "../../types/types";
import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Star from "./Star";
import SVGShape from "./SVGShape";

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;

interface Radii {
  innerRadius: number;
  outerRadius: number;
  centerX: number;
  centerY: number;
}

const imageToDataURL = (image: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!image.complete || image.naturalWidth === 0) {
      image.onload = () => {
        convertImage();
      };
      image.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    } else {
      convertImage();
    }

    function convertImage() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject(new Error('Canvas context is null'));
        }
      } catch (error) {
        reject(error);
      }
    }
  });
};

const Canvas: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);


  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);


  const [scrollOffsetX, setScrollOffsetX] = useState(0);
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  const [showMouseInfo, setShowMouseInfo] = useState(false);

  const [isPanning, setIsPanning] = useState(false);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState<number>(1);
  const [lastPos, setLastPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [svgImage, seSvgImage] =
  useState<HTMLImageElement | null>(null);

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [konvaShapes, setKonvaShapes] = useState<JSX.Element[]>([]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid SVG file.');
    }
  };
  const getRotation = (element: Element): number => {
    const transform = element.getAttribute('transform');
    if (transform) {
      const match = transform.match(/rotate\(([^)]+)\)/);
      if (match) {
        const params = match[1].split(',').map(Number);
        return params[0]; // Rotation angle
      }
    }
    return 0;
  };
  const calculateRadii = (points: number[]): Radii => {
    if (points.length < 2) {
      return {
        innerRadius: 0,
        outerRadius: 0,
        centerX: 0,
        centerY: 0,
      };
    }
  
    let centerX = 0;
    let centerY = 0;
    const numPoints = points.length / 2;
  
    // Calculate the center of the star
    for (let i = 0; i < numPoints; i++) {
      centerX += points[i * 2];
      centerY += points[i * 2 + 1];
    }
  
    centerX /= numPoints;
    centerY /= numPoints;
  
    let innerRadius = Infinity;
    let outerRadius = -Infinity;
  
    // Calculate distances from the center
    for (let i = 0; i < numPoints; i++) {
      const x = points[i * 2];
      const y = points[i * 2 + 1];
      const distance = Math.hypot(x - centerX, y - centerY);
  
      if (distance < innerRadius) {
        innerRadius = distance;
      }
      if (distance > outerRadius) {
        outerRadius = distance;
      }
    }
  
    return {
      innerRadius,
      outerRadius,
      centerX,
      centerY,
    };
  };
  useEffect(() => {
    if (svgContent) {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
      const newShapes: Shape[] = [];
      let localNextId = nextId;

      // Handle <rect> elements
      const rectElements = svgDoc.getElementsByTagName('rect');
      for (let i = 0; i < rectElements.length; i++) {
        const rect = rectElements[i];
        const x = parseFloat(rect.getAttribute('x') || '0');
        const y = parseFloat(rect.getAttribute('y') || '0');
        const width = parseFloat(rect.getAttribute('width') || '0');
        const height = parseFloat(rect.getAttribute('height') || '0');
        const fill = rect.getAttribute('fill') || 'black';
        const rotation = getRotation(rect);

        const newShape: Shape = {
          id: 'rectangle_' + (localNextId + i),
          type: 'rectangle',
          x: x - 50,
          y: y - 50,
          width: width,
          height: height,
          fill: fill,
          rotation: rotation,
        };
        newShapes.push(newShape);
      }
      localNextId += rectElements.length;

      // Handle <circle> elements
      const circleElements = svgDoc.getElementsByTagName('circle');
      for (let i = 0; i < circleElements.length; i++) {
        const circle = circleElements[i];
        const cx = parseFloat(circle.getAttribute('cx') || '0');
        const cy = parseFloat(circle.getAttribute('cy') || '0');
        const r = parseFloat(circle.getAttribute('r') || '0');
        const fill = circle.getAttribute('fill') || 'black';

        const newShape: Shape = {
          id: 'circle_' + (localNextId + i),
          type: 'circle',
          x: cx,
          y: cy,
          radius: r,
          fill: fill,
          rotation: 0,
        };
        newShapes.push(newShape);
      }
      localNextId += circleElements.length;


      const polygonElements = svgDoc.getElementsByTagName('polygon');
      for (let i = 0; i < polygonElements.length; i++) {
        const polygon = polygonElements[i];
        const pointsAttr = polygon.getAttribute('points') || '';
        const fill = polygon.getAttribute('fill') || 'black';
        const rotation = getRotation(polygon);

        // Convert points string to an array of numbers
        const points = pointsAttr
          .trim()
          .split(/\s+|,/)
          .map((coord) => parseFloat(coord));
        const radii = calculateRadii(points)

        const newShape: Shape = {
          id: 'star_' + (localNextId + i),
          type: 'star',
          x: radii.centerX,
          y: radii.centerY,
          numPoints:5,
          innerRadius: radii.innerRadius,
          outerRadius: radii.outerRadius,
          rotation: rotation,
          fill:fill
        };
        newShapes.push(newShape);
      }
      localNextId += circleElements.length;

      // Handle <image> elements
      const imageElements = svgDoc.getElementsByTagName('image');
      const imagePromises: Promise<Shape>[] = [];

      for (let i = 0; i < imageElements.length; i++) {
        const imageElement = imageElements[i];
        const x = parseFloat(imageElement.getAttribute('x') || '0');
        const y = parseFloat(imageElement.getAttribute('y') || '0');
        const width = parseFloat(imageElement.getAttribute('width') || '0');
        const height = parseFloat(imageElement.getAttribute('height') || '0');
        const rotation = getRotation(imageElement);
        const href =
          imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href') || '';

        const promise = new Promise<Shape>((resolve, reject) => {
          if (href) {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = href;

            img.onload = () => {
              const newShape: Shape = {
                id: 'SVG_' + (localNextId + i),
                type: 'SVG',
                image: img,
                x: x,
                y: y,
                width: width,
                height: height,
                rotation: rotation,
              };
              resolve(newShape);
            };

            img.onerror = () => {
              console.error(`Failed to load image at ${href}`);
              // You can choose to resolve with a placeholder or reject
              resolve({
                id: 'SVG_' + (localNextId + i),
                type: 'SVG',
                image: null,
                x: x,
                y: y,
                width: width,
                height: height,
                rotation: rotation,
              });
            };
          } else {
            // No href, resolve with a placeholder
            resolve({
              id: 'SVG_' + (localNextId + i),
              type: 'SVG',
              image: null,
              x: x,
              y: y,
              width: width,
              height: height,
              rotation: rotation,
            });
          }
        });

        imagePromises.push(promise);
      }
      localNextId += imageElements.length;

      // Wait for all image promises to resolve
      Promise.all(imagePromises).then((imageShapes) => {
        const allShapes = [...shapes, ...newShapes, ...imageShapes];
        setShapes(allShapes);
        setNextId(localNextId);
      });
    }
  }, [svgContent]);
  const saveAsSVG = () => {
    if (stageRef.current) {
      const svgPromises = shapes.map((shape) => {
        switch (shape.type) {
          case 'rectangle':
            const rotationRect = shape.rotation || 0;
            return Promise.resolve(
              `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" transform="rotate(${rotationRect}, ${shape.x}, ${shape.y})"/>`
            );
          case 'circle':
            return Promise.resolve(
              `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.radius}" fill="${shape.fill}" />`
            );
          case 'star':
            const rotationStar = shape.rotation || 0;
            const starPoints = calculateStarPoints(
              shape.x,
              shape.y,
              shape.numPoints || 5,
              shape.innerRadius || 10,
              shape.outerRadius || 20
            );
            return Promise.resolve(
              `<polygon points="${starPoints}" fill="${shape.fill}" transform="rotate(${rotationStar}, ${shape.x}, ${shape.y})"/>`
            );
          case 'SVG':
            if (shape.image) {
              return imageToDataURL(shape.image).then((dataURL) => {
                const rotationSVG = shape.rotation || 0;
                return `
                  <image 
                    href="${dataURL}" 
                    x="${shape.x}" 
                    y="${shape.y}" 
                    width="${shape.width}" 
                    height="${shape.height}" 
                    transform="rotate(${rotationSVG}, ${shape.x}, ${shape.y})"
                  />
                `;
              });
            } else {
              return Promise.resolve('');
            }
          default:
            return Promise.resolve('');
        }
      });

      Promise.all(svgPromises).then((resolvedSvgElements) => {
        const svgString = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${stageRef.current!.width()}px" height="${stageRef.current!.height()}px">
            ${resolvedSvgElements.join('')}
          </svg>
        `;
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        saveAs(blob, 'layout.svg');
      });
    }
  };
  const calculateStarPoints = (centerX: number, centerY: number, numPoints: number, innerRadius: number, outerRadius: number): string => {
    let results = '';
    const angle = Math.PI / numPoints;
    for (let i = 0; i < 2 * numPoints; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const currX = centerX + r * Math.sin(i * angle);
      const currY = centerY - r * Math.cos(i * angle);
      results += `${currX},${currY} `;
    }
    return results.trim();
  };
  // Load the background image
  useEffect(() => {
    const imagePath = "./background.svg"; // Replace with your SVG path
    loadBackgroundImage(imagePath);
    const svgPath = "./science.svg"; // Replace with your SVG path
    loadSvgImage(svgPath);
  }, []);
  const loadSvgImage = (src: string) => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      seSvgImage(img);
    };
    img.onerror = (err) => {
      console.error("Failed to load background image:", err);
    };
  };
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

  const handleWheel = (e: KonvaEventObject<WheelEvent>): void => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.5;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newPos = {
      x: (pointer.x - mousePointTo.x * newScale) > 0 ? 0: pointer.x - mousePointTo.x * newScale,
      y: (pointer.y - mousePointTo.y * newScale) > 0 ? 0: pointer.y - mousePointTo.y * newScale,
    };

    if(newScale > 0.18 && newScale < 5){
      setStageScale(newScale);
      setStagePos(newPos);
    }   
    
  };
  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
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

  const selectionRectRef = React.useRef<Konva.Rect>(null);
  const selection = React.useRef<{
    visible: boolean;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }>({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const updateSelectionRect = () => {
    const node = selectionRectRef.current;
    if (node) {
      node.setAttrs({
        visible: selection.current.visible,
        x: Math.min(selection.current.x1, selection.current.x2),
        y: Math.min(selection.current.y1, selection.current.y2),
        width: Math.abs(selection.current.x1 - selection.current.x2),
        height: Math.abs(selection.current.y1 - selection.current.y2),
        fill: "rgba(0, 161, 255, 0.3)",
      });
      node.getLayer()?.batchDraw();
    }
  };

  const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {
    
    const { x1, y1, x2, y2 } = selection.current;
    const moved = x1 !== x2 || y1 !== y2;
    if (moved) {
      return;
    }
    const stage = e.target.getStage();
    if (e.target === stage) {
      if(e.evt.button === 0)
        {
          toast("You clicked", {
            position: "top-right",
            autoClose: 1000, // Change this value to adjust the display duration
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }
      setSelectedIds([]);
      return;
    }   
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {    
    // Deselect shapes if clicked on empty area
    if (e.target === stageRef.current) {     
      const isElement = e.target.findAncestor(".elements-container", true);
      const isTransformer = e.target.findAncestor("Transformer");
      if (isElement || isTransformer) {
        return;
      }

     
      if (e.evt.button === 2) {
        e.evt.preventDefault(); // Prevent the context menu from appearing
        setIsPanning(true);
        const pointerPos = stageRef.current?.getPointerPosition();
        if (pointerPos) {
          setLastPos({
            x: (pointerPos.x - stagePos.x) / stageScale,
            y: (pointerPos.y - stagePos.y) / stageScale,
          });
        }
      }  
      else{
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) {
          selection.current.visible = true;
          selection.current.x1 = stagePos.x > 0 ?(pos.x) / stageScale: (pos.x - stagePos.x) / stageScale;
          selection.current.y1 = stagePos.y > 0 ?(pos.y) / stageScale:(pos.y - stagePos.y) / stageScale;
          selection.current.x2 = stagePos.x > 0 ?(pos.x) / stageScale: (pos.x - stagePos.x) / stageScale;
          selection.current.y2 = stagePos.y > 0 ?(pos.y) / stageScale:(pos.y - stagePos.y) / stageScale;
          updateSelectionRect();
        } 
      } 
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    if (isPanning) {
      const pointerPos = stageRef.current?.getPointerPosition();
      if (pointerPos) {

        const newPos = {
          x: pointerPos.x - lastPos.x * stageScale,
          y: pointerPos.y - lastPos.y * stageScale,
        };
        if(newPos.x/stageScale > 0 )
        {
          newPos.x = 0;
        }
        if(newPos.y/stageScale >0)
        {
          newPos.y = 0;
        }
        if(newPos.x/stageScale < -((CANVAS_WIDTH - window.innerWidth + 230) / stageScale) )
        {
          newPos.x =  -((CANVAS_WIDTH - window.innerWidth + 230) );
        }
        if(newPos.y/stageScale < -((CANVAS_HEIGHT - window.innerHeight + 30) / stageScale))
        {
          newPos.y = -((CANVAS_HEIGHT - window.innerHeight + 30) );
        }

        setStagePos(newPos);
        // let newX = stagePos.x; // Use current stage position
        // let newY = stagePos.y; // Use current stage position
    
        // // Calculate the change in position
        // const deltaX = (pointerPos.x - lastPos.x) / stageScale;
        // const deltaY = (pointerPos.y - lastPos.y) / stageScale;
    
        // // Update new position based on delta
        // // newX += deltaX;
        // // newY += deltaY;
    
        // // Boundary checks for x
        // if (newX > 0) {
        //   newX = 0; // Prevent panning to the right
        // }
        // if (newX < -((CANVAS_WIDTH - window.innerWidth + 230) / stageScale)) {
        //   newX = -((CANVAS_WIDTH - window.innerWidth + 230) / stageScale); // Prevent panning to the left
        // }
    
        // // Boundary checks for y
        // if (newY > 0) {
        //   newY = 0; // Prevent panning down
        // }
        // if (newY < -((CANVAS_HEIGHT - window.innerHeight + 30) / stageScale)) {
        //   newY = -((CANVAS_HEIGHT - window.innerHeight + 30) / stageScale); // Prevent panning up
        // }
    
        // const newPos = {
        //   x: newX,
        //   y: newY,
        // };
    
        // console.log(newPos);
        // setStagePos(newPos);
      }
    }
    const pos = stageRef.current?.getPointerPosition();
    if (pos) {
      setMouseCoords({ x: pos.x, y: pos.y });
      if (e.target === stageRef.current) {
        setShowMouseInfo(true);
      } else {
        setShowMouseInfo(false);
      }
    }
    if (!selection.current.visible) {
      return;
    }
    if (pos) {
      selection.current.x2 = stagePos.x > 0 ?(pos.x) / stageScale: (pos.x - stagePos.x) / stageScale;
      selection.current.y2 =stagePos.y > 0 ?(pos.y) / stageScale:(pos.y - stagePos.y) / stageScale;
      updateSelectionRect();
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setIsPanning(false);
    }
    else{

      selection.current.visible = false;
      updateSelectionRect();

      const { x1, y1, x2, y2 } = selection.current;
      const moved = x1 !== x2 || y1 !== y2;
      if (!moved) {
        return;
      }
      const selBox = selectionRectRef.current?.getClientRect();

      if (!selBox || !layerRef.current) {
        return;
      }
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
      toast("Ctrl clicked", {
        position: "top-right",
        autoClose: 1000, // Change this value to adjust the display duration
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } else if (metaPressed && !isSelected) {
      setSelectedIds([...selectedIds, id]);
      toast("Ctrl clicked", {
        position: "top-right",
        autoClose: 1000, // Change this value to adjust the display duration
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
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
        }else if(shape.type === "SVG"){
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
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
  const isPointInRotatedRect = (
    px: number,
    py: number,
    rect: RectangleAttrs
  ): boolean => {
    const { x, y, width, height, rotation } = rect;

    // Translate point to rectangle's local coordinate system
    const translatedX = px - x;
    const translatedY = py - y;

    // Convert rotation to radians and negate for inverse rotation
    const theta = -rotation * (Math.PI / 180);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Rotate the point
    const localX = translatedX * cos - translatedY * sin;
    const localY = translatedX * sin + translatedY * cos;

    // Check if the point is within the unrotated rectangle
    return localX >= 0 && localX <= width && localY >= 0 && localY <= height;
  };
  const isPointInRotatedSVG = (
    px: number,
    py: number,
    rect: SVGAttrs
  ): boolean => {
    const { x, y, width, height, rotation } = rect;

    // Translate point to rectangle's local coordinate system
    const translatedX = px - x;
    const translatedY = py - y;

    // Convert rotation to radians and negate for inverse rotation
    const theta = -rotation * (Math.PI / 180);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // Rotate the point
    const localX = translatedX * cos - translatedY * sin;
    const localY = translatedX * sin + translatedY * cos;

    // Check if the point is within the unrotated rectangle
    return localX >= 0 && localX <= width && localY >= 0 && localY <= height;
  };
  const isOverlapping = (x: number, y: number): boolean => {
    return shapes.some((shape) => {
      if (shape.type === "rectangle") {
        const rect = shape as RectangleAttrs;
        return isPointInRotatedRect(x, y, rect);
      } else if (shape.type === "circle") {
        const circle = shape as CircleAttrs;
        const dx = x - circle.x;
        const dy = y - circle.y;
        return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
      } else if(shape.type === "SVG"){
        const svg = shape as SVGAttrs;
        return isPointInRotatedSVG(x, y, svg);
      } else if (shape.type === "star") {
        const star = shape as StarAttrs;
        return (
          x >= star.x - star.outerRadius &&
          x <= star.x + star.outerRadius &&
          y >= star.y - star.outerRadius &&
          y <= star.y + star.outerRadius
        );
      }
      // Add checks for other shape types if necessary
      return false;
    });
  };
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const target = e.target as HTMLElement;
      const stageElement = target.closest(
        ".konvajs-content"
      ) as HTMLElement | null;

      if (!stageElement || !stageRef.current) return;

      const stageRect = stageElement.getBoundingClientRect();

      const pointer = {
        x: stagePos.x > 0 ? (e.clientX - stageRect.left)/ stageScale:  (e.clientX - stageRect.left - stagePos.x) / stageScale,
        y: stagePos.y > 0 ? (e.clientY - stageRect.top) /stageScale :(e.clientY - stageRect.top - stagePos.y) / stageScale,
      };

      const overlapping = isOverlapping(pointer.x, pointer.y);

      if (overlapping) {
        // Optionally, provide feedback to the user
        alert("Cannot place the shape over an existing one.");
        return;
      }

      const shapeType = e.dataTransfer.getData("text/plain") as
        | "rectangle"
        | "circle"
        | "star"
        | "science";

      let newShape: Shape;
      switch (shapeType) {
        case "rectangle":
          newShape = {
            id: "rectangle_" + nextId,
            type: "rectangle",
            x: pointer.x - 50,
            y: pointer.y - 50,
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
            x: pointer.x,
            y: pointer.y,
            radius: 50,
            fill: "red",
            rotation: 0,
          };
          break;
        case "star":
          newShape = {
            id: "star_" + nextId,
            type: "star",
            x: pointer.x,
            y: pointer.y,
            numPoints: 5,
            innerRadius: 30,
            outerRadius: 50,
            fill: "green",
            rotation: 0, // Initialize rotation
          };
          break;
        case "science":
          newShape = {
            id: "ball_" + nextId,
            image: svgImage,
            type: "SVG",
            x: pointer.x - 50, 
            y: pointer.y - 50,
            width: 100,
            height: 100,
            rotation: 0
          };
          break;
        default:
          return;
      }

      setShapes([...shapes, newShape]);
      setNextId(nextId + 1);
    },
    [shapes, nextId, stagePos, stageScale]
  );
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!stageRef.current) return;

    const stage = stageRef.current;
    const container = stage.container();
    const stageRect = container.getBoundingClientRect();

    const pointer = {
      x: (e.clientX - stageRect.left - stagePos.x) / stageScale,
      y: (e.clientY - stageRect.top - stagePos.y) / stageScale,
    };

    const overlapping = isOverlapping(pointer.x, pointer.y);

    // Set the dropEffect based on overlap
    e.dataTransfer.dropEffect = overlapping ? "none" : "copy";
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

  ////
  //--------------scroll for ruler-------------------------
  const handleTopRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll horizontally based on wheel delta
      canvasRef.current.scrollLeft -= e.deltaY;
    }
  };
  const handleLeftRulerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (canvasRef.current) {
      // Scroll vertically based on wheel delta
      canvasRef.current.scrollTop -= e.deltaY;
    }
  };
  //--------------scroll for ruler-------------------------
  ////

  ////
  //--------------delete shape-------------------------
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
  //--------------delete shape-------------------------
  ////
  return (
    <div className="container">
      <Ruler
        handleTopRulerWheel={handleTopRulerWheel}
        handleLeftRulerWheel={handleLeftRulerWheel}
        scrollOffsetX={scrollOffsetX}
        scrollOffsetY={scrollOffsetY}
        stagePos={stagePos}
        stageScale={stageScale}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="canvas-container"
        ref={canvasRef}
        style={{overflow:"hidden"}}
      >
        <ToastContainer />
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x > 0?0:stagePos.x}
          y={stagePos.y>0?0:stagePos.y}
          onWheel={handleWheel}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu} // Prevents default context menu
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              deleteSelectedShapes();
            }
          }}
          onClick={onClickTap}
          onTap={onClickTap}
          // onClick={handleStageClick}
          // style={{overflow:"hidden"}}
        >
          <Layer
            listening={false}
            // x={(-stagePos.x)/ stageScale}
            // y={(-stagePos.y)/ stageScale}
            // scaleX={1 / stageScale}
            // scaleY={1 / stageScale}
          >
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
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - rect.width;
                    const maxY = minY + stageHeight / scale - rect.height;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y };
                  }
                  return pos;
                };
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
                    // dragBoundFunc={dragBoundFunc}
                  />
                );
              }
              else if(shape.type === "SVG")
              {
                const svg = shape as SVGAttrs;
                return(
                  svg.image && ( 
                    
                    <SVGShape
                      image={svg.image}
                      key={svg.id}
                      id={svg.id}
                      x={svg.x}
                      y={svg.y}
                      width={svg.width}
                      height={svg.height}
                      rotation={svg.rotation}
                      onShapeClick={(e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, svg.id)}
                      // // Remove onTransformEnd from individual shapes
                      onDragEnd={(e) => handleDragEnd(e, svg.id)}
                      //dragBoundFunc={dragBoundFunc}
                    />
                  )
                )              
              }
               else if (shape.type === "circle") {
                const circle = shape as CircleAttrs;
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - circle.radius;
                    const maxY = minY + stageHeight / scale - circle.radius;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y};
                  }
                  return pos;
                };
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
                    // dragBoundFunc={dragBoundFunc}
                  />
                );
              } else if (shape.type === "star") {
                const star = shape as StarAttrs;
                const dragBoundFunc = (pos: { x: number; y: number }) => {
                  const stage = stageRef.current;
                  if (stage) {
                    // Get the size of the visible area
                    const stageWidth = stage.width();
                    const stageHeight = stage.height();
  
                    // Adjust for scaling and panning
                    const scale = stageScale;
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
  
                    // Calculate the visible area in stage coordinates
                    const minX = -xOffset / scale;
                    const minY = -yOffset / scale;
                    const maxX = minX + stageWidth / scale - star.outerRadius;
                    const maxY = minY + stageHeight / scale - star.outerRadius;
  
                    // Constrain the position
                    let x = pos.x;
                    let y = pos.y;
  
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                    return { x, y};
                  }
                  return pos;
                };
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
                    // dragBoundFunc={dragBoundFunc}
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
            <Rect ref={selectionRectRef} />

            {/* Selection Rectangle */}           
            
          </Layer>
          <Layer>
          {showMouseInfo && (
              <>
                {/* Display Mouse Coordinates */}
                <Text
                  x={stagePos.x > 0? (mouseCoords.x) / stageScale + 5 / stageScale: (mouseCoords.x - stagePos.x) / stageScale + 5 / stageScale}
                  y={
                    stagePos.y > 0 ? (mouseCoords.y) / stageScale - 15 / stageScale: (mouseCoords.y - stagePos.y) / stageScale - 15 / stageScale
                  } // 10px above the cursor
                  text={`(${Math.round(
                    stagePos.x > 0?(mouseCoords.x) / (stageScale * 10) :(mouseCoords.x - stagePos.x) / (stageScale * 10)
                  )}, ${Math.round(
                    stagePos.y > 0 ? (mouseCoords.y) / (stageScale * 10) : (mouseCoords.y - stagePos.y) / (stageScale * 10)
                  )})`}
                  fontSize={12 / stageScale}
                  fill="black"
                />
                <Line
                  points={[
                    stagePos.x > 0? 0:(0 - stagePos.x) / stageScale,
                    stagePos.y > 0? mouseCoords.y/stageScale :(mouseCoords.y - stagePos.y) / stageScale,
                    stagePos.x > 0? CANVAS_WIDTH  / stageScale:(CANVAS_WIDTH  - stagePos.x)  / stageScale,
                    stagePos.y > 0? mouseCoords.y / stageScale:(mouseCoords.y - stagePos.y) / stageScale,
                  ]} // Horizontal line
                  stroke="black"
                  strokeWidth={1 / stageScale}
                />
                <Line
                  points={[
                    stagePos.x > 0? mouseCoords.x/stageScale :(mouseCoords.x - stagePos.x) / stageScale,
                    stagePos.y > 0? 0:(0 - stagePos.y) / stageScale,
                    stagePos.x > 0? mouseCoords.x/stageScale :(mouseCoords.x - stagePos.x) / stageScale,
                    stagePos.y > 0? CANVAS_HEIGHT  / stageScale:(CANVAS_HEIGHT  - stagePos.y)  / stageScale,
                  ]} // Vertical line
                  stroke="black"
                  strokeWidth={1 / stageScale}
                />
              </>
            )}
          </Layer>
        </Stage>
      </div>
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 10,
          padding: "0px",
        }}
      >
        <button style={{
          backgroundColor: "#4CAF50", // Green background
          color: "white", // White text
          border: "none", // No border
          padding: "10px 10px", // Top/bottom and left/right padding
          textAlign: "center", // Center the text
          textDecoration: "none", // No underline
          display: "inline-block", // Inline block for proper spacing
          fontSize: "15px", // Font size
          borderRadius: "5px", // Rounded corners
          cursor: "pointer", // Pointer cursor on hover
          transition: "background-color 0.3s", // Smooth transition
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")} // Darker green on hover
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")} // Revert back on mouse leave
        onClick={saveAsSVG}
        >Save as SVG</button>
        <label
          style={{
            display: "inline-block",
            marginLeft: "10px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 15px",
            borderRadius: "5px",
            fontSize: "15px",
            textAlign: "center",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#45a049")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4CAF50")}
        >
          Upload SVG
          <input
            type="file"
            accept=".svg"
            style={{
              display: "none", // Hide the default file input
            }}
            onChange={handleFileChange} 
          />
        </label>
      </div>
    </div>
  );
};

export default Canvas;
