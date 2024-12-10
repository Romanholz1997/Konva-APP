import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Transformer,
  Text,
  Line,
  Label,
  Tag,
  Group,
} from "react-konva";

import Konva from "konva";
import { saveAs } from 'file-saver';
import { KonvaEventObject } from "konva/lib/Node";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from '../hooks/useHistory';
import Ruler from "./Ruler";
import RightBar from "./RightBar";
import Grid from "./Grid";
import RightContext from "./RightContext";

import Rectangle from "./Rectangle";
import Circle from "./Circle";
import Star from "./Star";
import SVGShape from "./SVGShape";
import KonvaText from './Text';

import {
    Shape,
    locationAttrs,
    ShapePropertyKey,
    RectangleAttrs,
    StarAttrs,
    CircleAttrs,
    SVGAttrs,
    HistoryState,
    TextAttrs
  } from "../types/types";

import { CanvasData, LayerData, Layers, CanvasStage } from "../types/canvasTypes";

interface SelectRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasProps {  
  isDrawRectangle: boolean;
  handleDrawRectangle: (newValue: boolean) => void;
}

const CANVAS_WIDTH = 4000;
const CANVAS_HEIGHT = 4000;
const GRID_SIZE = 10;

const Canvas: React.FC<CanvasProps> = ({isDrawRectangle, handleDrawRectangle}) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editShapes, setEditShapes] = useState<Shape[]>([]);
  const [groupPosition, setGroupPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({
    x:0,
    y:0
  });
  const stageRef = useRef<Konva.Stage>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const rectangleRef = useRef<Konva.Rect>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState<number>(1);
  const [lastPos, setLastPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showMouseInfo, setShowMouseInfo] = useState(false);
  const [crossFair, setCrossFair] = useState(true);

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
  const dragStartPositions = useRef<{ [key: string]: { x: number; y: number } }>({});
  const [gridLine, setSridLine] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);  
  const [groupBoundingBox, setGroupBoundingBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [selectionRect, setSelectionRect] = useState<SelectRectangle | null>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  /////-------background------------------
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
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
  /////-------background------------------


  ////--------------dragDrop-------------------
  const isOverlapping = (x: number, y: number): boolean => {
      return shapes.some((shape) => {
        if (shape.type === "rectangle") {
          const rect = shape as RectangleAttrs;
          return (
            x >= rect.x-rect.width/2 && x< rect.x + rect.width/2 &&
            y>= rect.y -rect.height/2 && y< rect.y + rect.height/2
          )
          // return isPointInRotatedRect(x, y, rect);
        } else if (shape.type === "circle") {
          const circle = shape as CircleAttrs;
          const dx = x - circle.x;
          const dy = y - circle.y;
          return Math.sqrt(dx * dx + dy * dy) <= circle.radius;
        } else if(shape.type === "SVG"){
          const svg = shape as SVGAttrs;
          return (
            x >= svg.x - svg.width/2 && x< svg.x + svg.width/2 &&
            y >= svg.y - svg.height/2 && y< svg.y + svg.height/2
          )
          // return isPointInRotatedSVG(x, y, svg);
        } else if (shape.type === "star") {
          const star = shape as StarAttrs;
          return (
            x >= star.x - star.radius &&
            x <= star.x + star.radius &&
            y >= star.y - star.radius &&
            y <= star.y + star.radius
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
        | "science"
        | "text";

      let newShape: Shape;
      switch (shapeType) {
        case "rectangle":
          newShape = {
            id: "rectangle_" + nextId,
            type: "rectangle",
            x: pointer.x,
            y: pointer.y,
            width: 100,
            height: 100,
            fill: "#0000ff",
            rotation: 0,
            scaleX:1,
            scaleY:1,
            groupId: null
          };
          break;
        case "circle":
          newShape = {
            id: "circle_" + nextId,
            type: "circle",
            x: pointer.x,
            y: pointer.y,
            radius: 50,
            fill: "#ff0000",
            rotation: 0,
            scaleX:1,
            scaleY:1,
            groupId: null
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
            radius: 50,
            fill: "#aaaa33",
            rotation: 0, // Initialize rotation
            scaleX:1,
            scaleY:1,
            groupId: null
          };
          break;
        case "science":
          const img = new Image();
          img.src = "./science.svg"; // Assign the imported SVG string to the image source
          newShape = {
            id: "ball_" + nextId,
            image: img,
            type: "SVG",
            x: pointer.x, 
            y: pointer.y,
            width: 100,
            height: 100,
            rotation: 0,
            scaleX:1,
            scaleY:1,
            groupId: null
          };
          break;  
        case "text":
          newShape = {
            id: "text_" + nextId,
            type: "text",
            text: 'Hello',
            fontSize: 30,
            fontFamily: 'Calibri',
            x: pointer.x, 
            y: pointer.y,
            rotation: 0,
            scaleX:1,
            scaleY:1,
            fill:"#ffff00",
            groupId: null
          };
          break;          
        default:
          return;
      }
      console.log(newShape);

      const updatedShapes = [...shapes, newShape];
      setShapes(updatedShapes);
      setNextId(nextId + 1);
      addState({ shapes: updatedShapes });
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
  ////--------------dragDrop-------------------

  ////--------------stageProps---------------------------
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
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {    
    setTooltipVisible(false);
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
        setIsSelecting(true);
        const pos = stageRef.current!.getPointerPosition()!;
        setSelectionRect({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
        });
      } 
  }
  };   
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    if (isPanning) {
      setMenuPos(null);
      const stage = stageRef.current;
      if(!stage) return;
      const pointerPos = stage.getPointerPosition();
      if (pointerPos) {
        // Calculate new position based on pointer position and last position
        const newPos = {
          x: pointerPos.x - lastPos.x * stageScale,
          y: pointerPos.y - lastPos.y * stageScale,
        };
    
          // Calculate the scaled canvas dimensions
        const scaledCanvasWidth = CANVAS_WIDTH * stageScale;
        const scaledCanvasHeight = CANVAS_HEIGHT * stageScale;

        // Calculate the boundaries based on the container size
        const container =  stage.container();
        const containerWidth = window.innerWidth - 230;
        const containerHeight = container.offsetHeight;

        // Left and Top boundaries (can't move beyond 0)
        newPos.x = Math.min(newPos.x, 0);
        newPos.y = Math.min(newPos.y, 0);

        // Right and Bottom boundaries
        const maxX = containerWidth - scaledCanvasWidth;
        const maxY = containerHeight - scaledCanvasHeight;

        newPos.x = Math.max(newPos.x, maxX);
        newPos.y = Math.max(newPos.y, maxY);

        // Update the stage position
        setStagePos(newPos);
      }
    }  
    const pos = stageRef.current?.getPointerPosition();
    if (pos) {
      
      if (e.target === stageRef.current) {
        setShowMouseInfo(true);
        setMouseCoords({ x: pos.x, y: pos.y });        
      } else {
        setShowMouseInfo(false);
      }
    }
    if (!isSelecting) return;
    const position = stageRef.current!.getPointerPosition()!;
    const sx = selectionRect!.x;
    const sy = selectionRect!.y;
    setSelectionRect({
      x: sx,
      y: sy,
      width: position.x - sx,
      height: position.y - sy,
    });
  };
  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {  
    if (isPanning) {
      setIsPanning(false);
    }
    else{
      if (isSelecting) {
        const selBox = selectionRect!;
        const shapesToSelect: string[] = [];
        const box = {
          x: Math.min(selBox.x, selBox.x + selBox.width),
          y: Math.min(selBox.y, selBox.y + selBox.height),
          width: Math.abs(selBox.width),
          height: Math.abs(selBox.height),
        };
  
        const container = layerRef.current;
        if (!container) return;
  
        // Step 1: Handle grouped shapes
        const groupIds = Array.from(new Set(shapes.map(shape => shape.groupId).filter(gid => gid !== null))) as string[];
  
        groupIds.forEach(groupId => {
          const groupNode = container.findOne(`#${groupId}`) as Konva.Group | undefined;
          if (groupNode) {
            const groupBox = groupNode.getClientRect();
            if (Konva.Util.haveIntersection(box, groupBox)) {
              const groupShapes = shapes.filter(shape => shape.groupId === groupId);
              groupShapes.forEach(shape => {
                if (!shapesToSelect.includes(shape.id)) {
                  shapesToSelect.push(shape.id);
                }
              });
            }
          }
        });
  
        // Step 2: Handle ungrouped shapes
        shapes.forEach((shape) => {
          if (shape.groupId) {
            // Skip shapes that are part of a group
            return;
          }
          const shapeNode = container.findOne('#' + shape.id) as Konva.Node;
          if (shapeNode) {
            const shapeBox = shapeNode.getClientRect();
            if (Konva.Util.haveIntersection(box, shapeBox)) {
              shapesToSelect.push(shape.id);
            }
          }
        });
  
        setSelectedIds(shapesToSelect);
        setIsSelecting(false);
        if (selectionRect) {
          const select = {
            x: (selectionRect.x - stagePos.x) / stageScale,
            y: (selectionRect.y - stagePos.y) / stageScale,
            width: selectionRect.width/ stageScale,
            height: selectionRect.height/ stageScale,
          }
          const locationShape: locationAttrs = {
            id:"location_" + Math.random(),
            type: 'location',
            x:select.x,
            y: select.y,
            width: select.width,
            height: select.height,
            rotation: 0,
            scaleX:1,
            scaleY:1,
            groupId: null,
            fill: "#0000ff",
            strokeWidth: 2,
          }
          if(isDrawRectangle)
          {
            setShapes(prev => [...prev, locationShape]);
            handleDrawRectangle(false);
          }
          
          // setSelectRectangle(prev => [...prev, select]);          
          saveStateDebounced();
        }        
        setSelectionRect(null);
      }
    }
  };
  const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    // Check if the rectangle is among the selected rectangles
    setMenuPos({ x: pointer.x, y: pointer.y});
  };
  const onClickTap = (e: Konva.KonvaEventObject<MouseEvent>) => {

    const { x1, y1, x2, y2 } = selection.current;
    const moved = x1 !== x2 || y1 !== y2;
    if (moved) {
      return;
    }
    const stage = e.target.getStage();
    if (e.target === stage) {
      setSelectedIds([]);      
      return;
    }   
  };    
  ////--------------stageProps---------------------------

  ////--------------rightBar-------------------------
  const handleGroupPositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue = parseFloat(value);
    if (isNaN(newValue) || !groupPosition) return;
  
    const delta = {
      x: name === 'groupX' ? newValue - groupPosition.x : 0,
      y: name === 'groupY' ? newValue - groupPosition.y : 0,
    };
  
    // Update positions of selected shapes
    setShapes((prevRectangles) =>
      prevRectangles.map((shape) => {
        if (selectedIds.includes(shape.id)) {
          let newX = shape.x + delta.x;
          let newY = shape.y + delta.y;
          if(newX < 50)
          {
            newX = 50;
          }
          else if(newX > 3950)
          {
            newX = 3950;
          }
          if(newY < 50)
          {
            newY = 50;
          }
          else if(newY > 3950)
          {
            newY = 3950;
          }
          return {
            ...shape,
            x: newX,
            y: newY,
          };
        } else {
          return shape;
        }
      })
    );
  
    // Update group position
    setGroupPosition((prevGroupPosition) => ({
      x: name === 'groupX' ? newValue : prevGroupPosition!.x,
      y: name === 'groupY' ? newValue : prevGroupPosition!.y,
    }));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericProps = [
      'x',
      'y',
      'width',
      'height',
      'radius',
      'innerRadius',
      'outerRadius',
      'fill',
      'fontSize',
      'text'
    ];
    const minValues: { [key: string]: number } = {
      x: 50,
      y: 50,
      width: 1,
      height: 1,
      radius: 0,
      innerRadius: 0,
      outerRadius: 0,
    };
  
    const maxValues: { [key: string]: number } = {
      x: 3950,
      y: 3950,
      width: 500,
      height: 500,
      radius: 100,
      innerRadius: 100,
      outerRadius: 100,
    };
    setEditShapes((prevEditShapes) =>
      prevEditShapes.map((shape) => {
        let newValue = numericProps.includes(name) ? parseFloat(value) : parseFloat(value);
        if (numericProps.includes(name)) {
          if(name !== 'fill')
          {
            if(name === 'fontSize')
            {
              newValue = parseFloat(value);
            }
            else if(name === 'text')
            {
              return {
                ...shape,
                [name]: value,
              };
            }
            if (newValue < minValues[name]) {
              newValue = minValues[name]; // Set to min if below
            } else if (newValue > maxValues[name]) {
              newValue = maxValues[name]; // Set to max if above
            }
          }
          else{
            return {
              ...shape,
              [name]: value,
            };
          }          
        }
        return {
          ...shape,
          [name]: newValue,
        };
      })
    );
  };
  const handleSave = () => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        const editedShape = editShapes.find((s) => s.id === shape.id);
        return editedShape ? editedShape : shape;
      })  
    );
  };
  function hasProperty<K extends ShapePropertyKey>(
    shape: Shape,
    key: K
  ): shape is Shape & Record<K, any> {
    return key in shape;
  }  
  const getCommonProperty = (propName: ShapePropertyKey): string | number => {
    if (editShapes.length === 0) {
      return '';
    }
  
    const firstShape = editShapes[0];
  
    if (!hasProperty(firstShape, propName)) {
      return '';
    }
  
    const firstValue = firstShape[propName];
  
    const isCommon = editShapes.every(
      (shape) => hasProperty(shape, propName) && shape[propName] === firstValue
    );
    if(propName === 'fill'){
      return isCommon ? firstValue : '';
    }
    else if(propName === 'text')
    {
      return isCommon ? firstValue : '';
    }
    else{
      return isCommon ? Math.round(firstValue) : '';
    }
    
  };
  const selectedShapeTypes = Array.from(new Set(editShapes.map((s) => s.type)));
  ////--------------rightBar-------------------------


  ////-------------shapeFunction-----------------------
  const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedIds.length > 0) {
      const pos: { [key: string]: { x: number; y: number } } = {};
      selectedIds.forEach((id) => {
        const node = layerRef.current!.findOne('#' + id) as Konva.Node | undefined;
        if (node) {
          pos[id] = { x: node.x(), y: node.y() };
        }
      });
      dragStartPositions.current = pos;
      dragStartPositions.current['group'] = { x: e.target.x(), y: e.target.y() };
    }
  };
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (selectedIds.length > 0) {
      const deltaX = e.target.x() - dragStartPositions.current['group'].x;
      const deltaY = e.target.y() - dragStartPositions.current['group'].y;

      selectedIds.forEach((id) => {
        const node = layerRef.current!.findOne('#' + id) as Konva.Node | undefined;
        const startPos = dragStartPositions.current[id];
        if (node && startPos) {
          node.position({
            x: startPos.x + deltaX,
            y: startPos.y + deltaY,
          });
        }
      });
      layerRef.current!.batchDraw();
    }
  };
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
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    const newShapes = shapes.map((shape) => {
      if (shape.id === id) {
        const newPos = snapToGrid({ x: e.target.x(), y: e.target.y() });
        return {
          ...shape,
          x: snapEnabled? newPos.x : e.target.x(),
          y: snapEnabled? newPos.y : e.target.y(),
        };
      }
      return shape;
    });
    setShapes(newShapes);
    saveStateDebounced();
  };
  const snapToGrid = (pos: { x: number; y: number }) => {
    const snappedX = Math.round(pos.x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(pos.y / GRID_SIZE) * GRID_SIZE;
    return { x: snappedX, y: snappedY };
  };
  const handleDoubleClick = (e: any) => {
    // Get the position of the double-click
    if(e.evt.button === 0)
    {
      toast("dblclicked", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };
  const onShapeMouseEnter = (
    e: Konva.KonvaEventObject<MouseEvent>,
    shape: Konva.Shape
  ) => {
    // Get the bounding box of the shape
    const bbox = shape.getClientRect();
    const tooltipX = bbox.x + bbox.width / 2;
    const tooltipY = bbox.y;

    setTooltipVisible(true);
    setTooltipText(shape.id());
    setTooltipX((tooltipX - stagePos.x)/stageScale);
    setTooltipY((tooltipY - stagePos.y)/stageScale);

    // Change the cursor to pointer
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'pointer';
    }
  };
  const onShapeMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
    setTooltipVisible(false);
    // Change the cursor back to default
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = 'default';
    }
  };
  const updateEditShapes = (ids: string[]) => {
    const selectedShapes = shapes.filter((shape) => ids.includes(shape.id));
    setEditShapes(selectedShapes);
  };
  useEffect(() => {
    updateEditShapes(selectedIds);
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (transformer && layer) {
      const nodes = selectedIds
        .map((id) => layer.findOne('#' + id))
        .filter((node): node is Konva.Node => node !== null && node !== undefined);
      transformer.nodes(nodes);
      transformer.getLayer()?.batchDraw();

      if (selectedIds.length > 1) {
        // Calculate bounding box for group selection
        const boundingBox = transformer.getClientRect();  
        setGroupBoundingBox({
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        });
      } else {
        setGroupBoundingBox(null);
      }
    }
  }, [selectedIds,  shapes]);
  const getBoundingBox = (ids: string[]) => {
    const selectedShapes = shapes.filter((shape) => ids.includes(shape.id));
    // const clientRects = shapes.map((shape) => shape.getClientRect());
    const minX = Math.min(...selectedShapes.map((rect) => rect.x));
    const minY = Math.min(...selectedShapes.map((rect) => rect.y));
    return {
      x: minX,
      y: minY,
    };
  };
  useEffect(() => {
    updateEditShapes(selectedIds);  
    if (selectedIds.length > 1) {
      // Multiple shapes selected, calculate group position
      const layer = layerRef.current;
      if (layer) {
        const selectedShapes = selectedIds
          .map((id) => layer.findOne<Konva.Rect>('#' + id))
          .filter((node): node is Konva.Rect => node !== null);
  
        if (selectedShapes.length > 0) {
          const boundingBox = getBoundingBox(selectedIds);
          setGroupPosition({ x: boundingBox.x, y: boundingBox.y });
        }
      }
    } else {
      setGroupPosition(null);
    }
  }, [selectedIds, shapes]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        // Call the function to delete selected shapes
        deleteSelectedShapes();
      }
      if (e.key === "Control" && selectedIds.length > 0) {
        setShapes((prevShapes) =>
          prevShapes.map((shape) =>
            selectedIds.includes(shape.id) ? { ...shape, rotation: 0 } : shape
          )
        );
      }
    };

    // Add event listener to the window object
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIds.length === 0) return;

      setShapes((prevShapes) => {
        return prevShapes.map((shape) => {
          if (!selectedIds.includes(shape.id)) return shape;

          // Calculate new position based on key
          let newX = shape.x;
          let newY = shape.y;

          if (e.key === "ArrowLeft") newX -= 10;
          if (e.key === "ArrowRight") newX += 10;
          if (e.key === "ArrowUp") newY -= 10;
          if (e.key === "ArrowDown") newY += 10;

          // Boundary checks
          if (shape.type === "rectangle" || shape.type === "SVG") {
            const halfWidth = (shape.width || 0) / 2;
            const halfHeight = (shape.height || 0) / 2;
          
            // Adjust boundaries to account for the offset
            newX = Math.max(halfWidth, Math.min(CANVAS_WIDTH - halfWidth, newX));
            newY = Math.max(halfHeight, Math.min(CANVAS_HEIGHT - halfHeight, newY));
          } else if (shape.type === "circle" ) {
            const radius = shape.radius || 0;
            newX = Math.max(radius, Math.min(CANVAS_WIDTH - radius, newX));
            newY = Math.max(radius, Math.min(CANVAS_HEIGHT - radius, newY));
          }
          else if(shape.type === "star" ) {
            const radius = shape.radius || 0;
            newX = Math.max(radius, Math.min(CANVAS_WIDTH - radius, newX));
            newY = Math.max(radius, Math.min(CANVAS_HEIGHT - radius, newY));
          }

          // Collision detection
          const isColliding = prevShapes.some(
            (other) =>
              other.id !== shape.id &&
              isOverlap(
                { ...shape, x: newX, y: newY },
                other
              )
          );

          if (isColliding) {
            return shape; // Prevent movement
          }

          return { ...shape, x: newX, y: newY };
        });
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds]);
  const isOverlap = (shape1: Shape, shape2: Shape): boolean => {
    if ((shape1.type === "rectangle" && shape2.type === "rectangle") || (shape1.type === "SVG" && shape2.type === "SVG") ||(shape1.type === "SVG" && shape2.type === "rectangle") || (shape1.type === "rectangle" && shape2.type === "SVG")) {
      return !(
        shape1.x + (shape1.width || 0) <= shape2.x ||
        shape2.x + (shape2.width || 0) <= shape1.x ||
        shape1.y + (shape1.height || 0) <= shape2.y ||
        shape2.y + (shape2.height || 0) <= shape1.y
      );
    }

    if ((shape1.type === "circle" && shape2.type === "circle") || (shape1.type === "star" && shape2.type === "star") ||(shape1.type === "star" && shape2.type === "circle") || (shape1.type === "circle" && shape2.type === "star")) {
      const dx = shape1.x - shape2.x;
      const dy = shape1.y - shape2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (shape1.radius || 0) + (shape2.radius || 0);
    }

    if ((shape1.type === "circle" && shape2.type === "rectangle") || (shape1.type === "circle" && shape2.type === "SVG") || ( shape1.type === "star" && shape2.type === "rectangle")  || (shape1.type === "star" && shape2.type === "SVG")) {
      const rectLeft = shape2.x - (shape2.width || 0) / 2;
      const rectRight = shape2.x + (shape2.width || 0) / 2;
      const rectTop = shape2.y - (shape2.height || 0) / 2;
      const rectBottom = shape2.y + (shape2.height || 0) / 2;
      
      // Clamp the circle's center to the rectangle's bounds
      const closestX = Math.max(rectLeft, Math.min(shape1.x, rectRight));
      const closestY = Math.max(rectTop, Math.min(shape1.y, rectBottom));
      
      // Calculate the distance from the circle's center to the closest point
      const dx = shape1.x - closestX;
      const dy = shape1.y - closestY;
      
      // Check if the distance is less than the circle's radius
      return dx * dx + dy * dy < (shape1.radius || 0) * (shape1.radius || 0);
    }
    if ((shape1.type === "rectangle" && shape2.type === "circle") || (shape1.type === "rectangle" && shape2.type === "star") || (shape1.type === "SVG" && shape2.type === "circle") || (shape1.type === "SVG" && shape2.type === "star")) {
      return isOverlap(shape2, shape1);
    }
    return false;
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
            width: Math.max(5, Math.abs(node.width() * scaleX)),
            height: Math.max(5, Math.abs(node.height() * scaleY)),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        }
        else if (shape.type === "location") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            width: Math.max(5, Math.abs(node.width() * scaleX)),
            height: Math.max(5, Math.abs(node.height() * scaleY)),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        }
        else if (shape.type === "text") {
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            fontSize: Math.max(5, Math.abs(shape.fontSize * ((scaleX + scaleY) / 2))),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        } else if (shape.type === "circle") {
          const avgScale =(Math.abs(scaleX) + Math.abs(scaleY)) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            radius: Math.max(5, Math.abs(shape.radius * avgScale)),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        } else if (shape.type === "star") {
          const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            numPoints:shape.numPoints,
            innerRadius: Math.max(5, Math.abs(shape.innerRadius * avgScale)),
            outerRadius: Math.max(5, Math.abs(shape.radius * avgScale)),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        }else if(shape.type === "SVG"){
          return {
            ...shape,
            x: node.x(),
            y: node.y(),
            rotation,
            width: Math.max(5, Math.abs(node.width() * scaleX)),
            height: Math.max(5, Math.abs(node.height() * scaleY)),
            scaleX:shape.scaleX,
            scaleY:shape.scaleY
          };
        } else {
          return shape;
        }
      } else {
        return shape;
      }
    });
    setShapes(newShapes);
    saveStateDebounced();
  };
  ////-------------shapeFunction-----------------------


  ////--------------rightContext-------------------------
  const handleCloseMenu = () => {
    setMenuPos(null);
  };  
  const handleAlign = (alignment:  'left' | 'right' | 'top' | 'bottom') => {
    const layer = layerRef.current;
    if (!layer) return;

    const selectedShapes = selectedIds
      .map((id) => layer.findOne<Konva.Rect>('#' + id))
      .filter((node): node is Konva.Rect => node !== null);
  
    if (selectedShapes.length === 0) return;
  
    const clientRects = selectedShapes.map((shape) =>
      shape.getClientRect({ relativeTo: layer })
    ); 

    const minX = Math.min(...clientRects.map((rect) => rect.x));
    const minY = Math.min(...clientRects.map((rect) => rect.y));
    const maxX = Math.max(...clientRects.map((rect) => (rect.x + rect.width)));
    const maxY = Math.max(...clientRects.map((rect) => (rect.y + rect.height)));
  
    setShapes((prevRectangles) => {
      return prevRectangles.map((rect) => {
        if (selectedIds.includes(rect.id)) {
          const shape = layer.findOne<Konva.Rect>('#' + rect.id);
          if (shape) {
            let clientRect = shape.getClientRect({ relativeTo: layer });
            const newMinX = minX - (clientRect.x - rect.x);
            const newMinY = minY - (clientRect.y - rect.y);
            const newMaxX = maxX - clientRect.width + (rect.x - clientRect.x);//+ clientRect.width;//- (clientRect.x  - rect.x);
            const newMaxY = maxY - clientRect.height + (rect.y - clientRect.y);
            switch(alignment) {
              case "left":
                return { ...rect, x: newMinX };
              case "right":
                return { ...rect, x: newMaxX };
              case "top":
                return { ...rect, y: newMinY };
              case "bottom":
                  return { ...rect, y: newMaxY };
              default:
                return rect;
             
            }
          }
        }
        return rect;
      });
    });
    saveStateDebounced();
  
    setMenuPos(null); // Close the menu after action
  };
  const deleteSelectedShapes = () => {
    if (selectedIds.length > 0) {
      // Filter out the selected shapes
      const newShapes = shapes.filter(
        (shape) => !selectedIds.includes(shape.id)
      );
      setShapes(newShapes);
      setSelectedIds([]);
      saveStateDebounced();
    }
  };
  const getBoundingBoxs = (shape: Konva.Shape) => {
    return shape.getClientRect({ relativeTo: layerRef.current! });
  };
  const DistributeShapes = (direction: 'horizontal' | 'vertical') => {
    const layer = layerRef.current;
    if (!layer) return;

    // Retrieve selected Konva nodes
    const selectedNodes = selectedIds
      .map((id) => layer.findOne<Konva.Shape>(`#${id}`))
      .filter((node): node is Konva.Shape => node !== null);

    if (selectedNodes.length <= 1) {
      console.warn('Select at least two shapes to distribute.');
      handleCloseMenu();
      return;
    }

    // Get client rects for selected shapes
    const shapesWithRects = selectedNodes.map((shape) => ({
      node: shape,
      rect: getBoundingBoxs(shape),
    }));

    // Sort shapes based on the distribution direction
    const sortedShapes = [...shapesWithRects].sort((a, b) => {
      return direction === 'horizontal' ? a.rect.x - b.rect.x : a.rect.y - b.rect.y;
    });

    // Calculate total size along the distribution axis
    const totalSize = sortedShapes.reduce((acc, { rect }) => {
      return acc + (direction === 'horizontal' ? rect.width : rect.height);
    }, 0);

    // Determine the starting and ending positions
    const minPos = direction === 'horizontal'
      ? Math.min(...shapesWithRects.map(({ rect }) => rect.x))
      : Math.min(...shapesWithRects.map(({ rect }) => rect.y));

    const maxPos = direction === 'horizontal'
      ? Math.max(...shapesWithRects.map(({ rect }) => rect.x + rect.width))
      : Math.max(...shapesWithRects.map(({ rect }) => rect.y + rect.height));

    // Calculate the total available space and the gap between shapes
    const totalSpace = (direction === 'horizontal' ? maxPos - minPos : maxPos - minPos);
    const gaps = sortedShapes.length - 1;
    const totalGaps = gaps > 0 ? totalSpace - totalSize : 0;
    const unitGap = gaps > 0 ? totalGaps / gaps : 0;

    // Assign new positions based on the calculated gaps
    let currentPos = minPos;

    const newPositions: { id: string; x?: number; y?: number }[] = sortedShapes.map(({ rect, node }) => {
      const newPos = currentPos;
      currentPos += (direction === 'horizontal' ? rect.width : rect.height) + unitGap;

      // Determine new x and y based on shape type and direction
      let newX = undefined;
      let newY = undefined;
      switch (node.getClassName()) {
        case 'Rect':
          if (direction === 'horizontal') {
            newX = newPos;
          } else {
            newY = newPos;
          }
          break;
        case 'Image':
          if (direction === 'horizontal') {
            newX = newPos;
          } else {
            newY = newPos;
          }
          break;
        case 'Text':
          if (direction === 'horizontal') {
            newX = newPos;
          } else {
            newY = newPos;
          }
          break;
        case 'Circle':
          if (direction === 'horizontal') {
            // For circles, newPos represents the leftmost point, adjust to center
            const radius = (node as Konva.Circle).radius();
            newX = newPos + radius;
          } else {
            // For circles, newPos represents the topmost point, adjust to center
            const radiusCircle = (node as Konva.Circle).radius();
            newY = newPos + radiusCircle;
          }
          break;
        case 'Star':
          if (direction === 'horizontal') {
            // For stars, newPos represents the leftmost point, adjust to center
            const outerRadius = (node as Konva.Star).outerRadius();
            newX = newPos + outerRadius;
          } else {
            // For stars, newPos represents the topmost point, adjust to center
            const outerRadiusStar = (node as Konva.Star).outerRadius();
            newY = newPos + outerRadiusStar;
          }
          break;
        // Add more cases for different shapes as needed
        default:
          break;
      }

      return {
        id: node.id(),
        x: newX,
        y: newY,
      };
    });

    // Update the shapes state with new positions
    setShapes((prevShapes) =>
      prevShapes.map((shape) => {
        const newPos = newPositions.find((p) => p.id === shape.id);
        if (newPos) {     
            
          const konvaShape = layer.findOne<Konva.Shape>('#' + shape.id);
          if (konvaShape) {
            const clientRect = konvaShape.getClientRect({ relativeTo: layer });
            if (direction === 'horizontal') {
              if( Math.abs(clientRect.x - minPos) < 0.01 || Math.abs((clientRect.x + clientRect.width) - maxPos) < 0.01)
                {
                  return {
                    ...shape,
                    x: shape.x,
                    y: newPos.y !== undefined ? newPos.y : shape.y,
                  };
                }
            } else {
              if( Math.abs(clientRect.y - minPos) < 0.01 || Math.abs((clientRect.y + clientRect.height) - maxPos) < 0.01)              
                {
                  return {
                    ...shape,
                    x: newPos.x !== undefined ? newPos.x : shape.x,
                    y: shape.y,
                  };
                }
            }
            switch (shape.type) {
              case 'rectangle':
                return {
                  ...shape,
                  x: newPos.x !== undefined ? newPos.x - (clientRect.x - shape.x) : shape.x,
                  y: newPos.y !== undefined ? newPos.y - (clientRect.y - shape.y) : shape.y,
                };
              case 'SVG':
                return {
                  ...shape,
                  x: newPos.x !== undefined ? newPos.x -(clientRect.x - shape.x) : shape.x,
                  y: newPos.y !== undefined ? newPos.y - (clientRect.y - shape.y) : shape.y,
                };
              default:
                return {
                  ...shape,
                  x: newPos.x !== undefined ? newPos.x : shape.x,
                  y: newPos.y !== undefined ? newPos.y : shape.y,
                };
            }
          }
        }
        return shape;
      })
    );   
    
  };
  const flipSelectedShapesHorizontally = () => {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        selectedIds.includes(shape.id)
          ? { ...shape, scaleX: (shape.scaleX ? shape.scaleX : 1) * -1 }
          : shape
      )
    );
    handleCloseMenu();
  };
  const flipSelectedShapesVertically = () => {
    setShapes((prevShapes) =>
        prevShapes.map((shape) =>
        {
          if (!selectedIds.includes(shape.id)) return shape;
          let scale = shape.scaleY ? shape.scaleY : 1;
          const newScaleX = scale * -1;           
          return {
            ...shape,
            scaleY: newScaleX,
          };
        }              
      )
    );
    handleCloseMenu();
  };
  const HandleCrossFair = () =>{
    setCrossFair((prev) => !prev);
  }
  const toggleSnap = () => {
    setSnapEnabled((prev) => !prev);
  };
  const HandleGridLine = () =>{
    setSridLine((prev) => !prev);
  }
  const areShapesGrouped = () => {
    const groupIds = selectedIds.map((id) => {
      const shape = shapes.find((s) => s.id === id);
      return shape?.groupId;
    });
    return groupIds.every((gid) => gid && gid === groupIds[0]);
  };
  const handleGroup = () => {
    // handleSetGroup();
    if(!areShapesGrouped())
    {
      console.log("group");
      const newGroupId = 'group-' + Date.now();
      const updatedShapes = shapes.map((shape) => {
        if (selectedIds.includes(shape.id)) {          
          return { ...shape, groupId: newGroupId };
        }
        return shape;
      });
      console.log(updatedShapes);
      setShapes(updatedShapes);
      setSelectedIds([]);
    }
    else{
      console.log("ungroup");
      const updatedShapes = shapes.map((shape) => {
        if (selectedIds.includes(shape.id)) {
          return { ...shape, groupId: null };
        }
        return shape;
      });
      setShapes(updatedShapes);
      setSelectedIds([]);
    }
  };
  ////--------------rightContext-------------------------


  const dragBoundFunc = (pos: { x: number; y: number }, group: Konva.Rect) => {
    const stage = stageRef.current;
    if (stage && group) {
      const scale = stageScale;
      const { x: stageX, y: stageY } = stagePos;

      // Get the group's bounding rectangle
      const groupBox = group.getClientRect();
      // Calculate the minimum and maximum positions
      const minX = 0;
      const minY = 0;
      const maxX = CANVAS_WIDTH * scale - groupBox.width * scale + stageX;
      const maxY = CANVAS_HEIGHT * scale - groupBox.height * scale + stageY;

      // Apply constraints
      let x = pos.x;
      let y = pos.y;

      x = Math.max(minX, Math.min(x, maxX));
      y = Math.max(minY, Math.min(y, maxY));

      return { x, y };
    }
    return pos;
  };

  ////--------------SaveAsSVG-------------------------
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
              shape.radius || 20
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
  ////--------------SaveAsSVG-------------------------

  ////--------------SaveAsJson-----------------------
  const saveAsJson = () => {
    const jsonLayer1: LayerData = {
      name: "layer1",
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      image: "./background.svg"// Ensure `shapes` is defined in your scope
    };
    const jsonLayer2: LayerData = {
      name: "layer2",
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      shapes: shapes // Ensure `shapes` is defined in your scope
    }; 
    const jsonLayers: Layers = {
      layer1: jsonLayer1,
      layer2: jsonLayer2
    };  
    const jsonStage: CanvasStage = {
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
      layers: jsonLayers
    };  
    const currentTime = new Date().toISOString(); // Get current time in ISO format
    const jsonData: CanvasData = {
      canvasprofile: {
        name: "default report template",
        lastupdated: currentTime
      },
      canvasstage: jsonStage
    };  
    const jsonString = JSON.stringify(jsonData, null, 2); // Pretty print with 2 spaces

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // Create a link element for downloading
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'canvasData.json'; // Specify the file name
  
    // Append to the document and trigger the download
    document.body.appendChild(link);
    link.click();
  
    // Clean up by removing the link element
    document.body.removeChild(link);
  };
  ////--------------SaveAsJson-----------------------

  ////--------------importJson------------------------
  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true); // Start loading
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          const importedShapes: Shape[] = (jsonData.shapes || []).map((shape: any) => ({
            ...shape,
            x: Number(shape.x),
            y: Number(shape.y),
            width: shape.width ? Number(shape.width) : undefined,
            height: shape.height ? Number(shape.height) : undefined,
            radius: shape.radius ? Number(shape.radius) : undefined,
            rotation: shape.rotation ? Number(shape.rotation) : undefined,
            scaleY: shape.scaleY ? Number(shape.scaleY) : undefined,
            scaleX: shape.scaleX ? Number(shape.scaleX) : undefined, // Fixed scaleX assignment
            innerRadius: shape.innerRadius ? Number(shape.innerRadius) : undefined,
            numPoints: shape.numPoints ? Number(shape.numPoints) : undefined,
            strokeWidth: shape.strokeWidth ? Number(shape.strokeWidth) : undefined,
          }));
          setShapes(importedShapes);
        } catch (error) {
          console.error("Invalid JSON file:", error);
        } finally {
          setLoading(false); // Stop loading
        }
      };

      reader.readAsText(file);
    }
  };

  // Cleanup effect to reset shapes on unmount or when loading state changes
  useEffect(() => {
    return () => {
      setShapes([]); // Clear shapes when component unmounts or before re-running
    };
  }, []);

  ////--------------importJson------------------------

  
  ////----------------Undo/Redo-----------------------
  const initialState: HistoryState = { shapes: shapes };
  const { addState, undo, redo, canUndo, canRedo } = useHistory<HistoryState>(initialState);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const saveStateDebounced = useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      addState({ shapes });
    }, 50);
  }, [addState, shapes]);
  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setShapes(previousState.shapes);
      setSelectedIds([]);
    }
  }, [undo]);
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setShapes(nextState.shapes);
      setSelectedIds([]);
    }
  }, [redo]);
  ////----------------Undo/Redo-----------------------

  return (
    <div className="container">
      <Ruler
        stagePos={stagePos}
        stageScale={stageScale}
      />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="canvas-container"
        ref={canvasRef}
        style={{overflow:"hidden", display: 'flex'}}
      >
        {loading && (
          <div className="overlay" aria-busy="true" aria-live="polite">
            <div className="spinner" />
            <p>Loading...</p>
          </div>
        )}
        <ToastContainer />
        <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x > 0 ? 0:stagePos.x}
        y={stagePos.y > 0 ? 0:stagePos.y}
        onWheel={handleWheel}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu} // Prevents default context menu
        onClick={onClickTap}
        >
          <Layer
            listening={false}
            name="backgroundLayer"
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

          { gridLine && (
            <Grid width={CANVAS_WIDTH} height={CANVAS_WIDTH} cellSize={GRID_SIZE} />
          )}

          <Layer ref={layerRef}  name="shapeLayer">
            {/* {selectRectangle.map((selectRect) => {
                // Calculate the adjusted positions based on stagePos and stageScale
                const adjustedX = (selectRect.x);
                const adjustedY = (selectRect.y);
                const adjustedWidth = selectRect.width;
                const adjustedHeight = selectRect.height;

                // Define the points for the rectangle using Line
                const points = [
                    adjustedX, adjustedY, // Top-left
                    adjustedX + adjustedWidth, adjustedY, // Top-right
                    adjustedX + adjustedWidth, adjustedY + adjustedHeight, // Bottom-right
                    adjustedX, adjustedY + adjustedHeight, // Bottom-left
                    adjustedX, adjustedY // Back to Top-left to close the rectangle
                ];
                return (
                    <Line
                        points={points}
                        stroke='blue' // Line color
                        strokeWidth={2 / stageScale} // Line width
                        key={Math.random()} // Ensure each Line has a unique key
                    />
                );
            })} */}
            {(() => {
              const groupedShapes = shapes.reduce((acc, shape) => {
                if (shape.groupId) {
                  if (!acc[shape.groupId]) {
                    acc[shape.groupId] = [];
                  }
                  acc[shape.groupId].push(shape);
                }
                return acc;
              }, {} as { [key: string]: Shape[] });

              const ungroupedShapes = shapes.filter((shape) => !shape.groupId);
              const elements: React.ReactNode[] = [];
              // Render grouped shapes
              Object.keys(groupedShapes).forEach((groupId) => {
                const groupShapes = groupedShapes[groupId];              
                const dragBoundFunc = (pos: { x: number; y: number }, group: Konva.Group) => {
                  const stage = stageRef.current;
                  if (stage && group) {
                    const scale = stageScale; // Assuming this is the current stage scale
                    // Get the group's bounding rectangle without additional scaling
                    const groupBox = group.getClientRect({ relativeTo: stage });               
                    const xOffset = stagePos.x;
                    const yOffset = stagePos.y;
                    const minX = (xOffset) * scale;
                    const minY = (yOffset ) * scale;
                    const maxX = (CANVAS_WIDTH -  groupBox.width) * scale  + xOffset;
                    const maxY = (CANVAS_WIDTH -  groupBox.height) * scale  + yOffset;                  
                    // Apply constraints
                    let x = pos.x;
                    let y = pos.y;              
                    x = Math.max(minX, Math.min(x, maxX));
                    y = Math.max(minY, Math.min(y, maxY));
                
                    return { x, y };
                  }
                  return pos;
                };                
                elements.push(
                  <Group
                    key={groupId}
                    id={groupId}
                    draggable
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    dragBoundFunc={(pos) => dragBoundFunc(pos, groupRef.current!)}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      const ids = groupShapes.map((shape) => shape.id);
                      setSelectedIds(ids);
                    }}
                    onContextMenu={handleContextMenu}
                    ref={groupRef}
                  >
                    {groupShapes.map((shape) => {
                      const commonProps = {
                        id: shape.id,
                        x: shape.x,
                        y: shape.y,
                        rotation: shape.rotation ? shape.rotation : 0,
                        scaleX: shape.scaleX? shape.scaleX : 1,
                        scaleY: shape.scaleY? shape.scaleY: 1,
                        onShapeClick: () => null,
                        draggable: false,
                        onDragMove: () => null,
                        onDragEnd: () => null,
                        onDblClick: () => null,
                        onShapeMouseEnter: () => null,
                        onShapeMouseLeave: () => null,
                      };
              
                      switch (shape.type) {
                        case "rectangle": {
                          const rect = shape as RectangleAttrs;
                          return (
                            <Rectangle
                              {...commonProps}
                              key={shape.id}
                              x={rect.x}
                              y={rect.y}
                              width={rect.width}
                              height={rect.height}
                              fill={rect.fill}                             
                            />
                          );
                        }
                        case "location": {
                          const rect = shape as locationAttrs;
                          return (
                            <Rectangle
                              {...commonProps}
                              key={shape.id}
                              x={rect.x}
                              y={rect.y}
                              width={rect.width}
                              height={rect.height}
                              stroke={rect.fill}
                              strokeWidth={rect.strokeWidth}
                              offsetX={0}
                              offsetY={0}
                            />
                          );
                        }
                        case "SVG": {
                          const svg = shape as SVGAttrs;
                          return svg.image ? (
                            <SVGShape
                              {...commonProps}
                              key={shape.id}
                              image={svg.image}
                              width={svg.width}
                              height={svg.height}                              
                            />
                          ) : null;
                        }
                        case "circle": {
                          const circle = shape as CircleAttrs;
                          return (
                            <Circle
                              {...commonProps}
                              key={shape.id}
                              radius={circle.radius}
                              fill={circle.fill}                              
                            />
                          );
                        }
                        case "star": {
                          const star = shape as StarAttrs;
                          return (
                            <Star
                              {...commonProps}
                              key={shape.id}
                              numPoints={star.numPoints}
                              innerRadius={star.innerRadius}
                              outerRadius={star.radius}
                              fill={star.fill}                              
                            />
                          );
                        }
                        case "text":{
                          const text = shape as TextAttrs;
                          return (
                            <Text
                              {...commonProps}
                              key={shape.id}
                              text={text.text}
                              fontSize={text.fontSize}
                              fontFamily={text.fontFamily}
                              fill={text.fill}                              
                            />
                          );
                        }
                        default:
                          return null;
                      }
                    })}
                  </Group>
                );
              });
              // Render ungrouped shapes
              elements.push(
                ungroupedShapes.map((shape) => {
                  const commonProps = {
                    id: shape.id,
                    x: shape.x,
                    y: shape.y,
                    rotation: shape.rotation ? shape.rotation : 0,
                    scaleX: shape.scaleX? shape.scaleX : 1,
                    scaleY: shape.scaleY? shape.scaleY: 1,
                    onShapeClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
                    draggable: true,
                    onDragMove: () => null,
                    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(e, shape.id),
                    onDblClick: handleDoubleClick,
                    onShapeMouseEnter: onShapeMouseEnter,
                    onShapeMouseLeave: onShapeMouseLeave,
                  };
                  if (shape.type === "rectangle") {
                    const rect = shape as RectangleAttrs;
                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const stage = stageRef.current;
                      if (stage) {
                        const scale = stageScale;
                        const xOffset = stagePos.x;
                        const yOffset = stagePos.y;
                        const minX = (xOffset + rect.width/2) * scale;
                        const minY = (yOffset + rect.height/2) * scale;
                        const maxX = (CANVAS_WIDTH -  rect.width/2) * scale  + stagePos.x;
                        const maxY = (CANVAS_WIDTH -  rect.height/2) * scale  + stagePos.y;  
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
                        {...commonProps}
                        key={shape.id}
                        width={rect.width}
                        height={rect.height}
                        fill={rect.fill}
                        dragBoundFunc={dragBoundFunc}
                      />
                    );
                  }
                  if (shape.type === "location") {
                    const rect = shape as locationAttrs;
                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const stage = stageRef.current;
                      if (stage) {
                        const scale = stageScale;
                        const xOffset = stagePos.x;
                        const yOffset = stagePos.y;
                        const minX = (xOffset) * scale;
                        const minY = (yOffset ) * scale;
                        const maxX = (CANVAS_WIDTH -  rect.width) * scale  + stagePos.x;
                        const maxY = (CANVAS_WIDTH -  rect.height) * scale  + stagePos.y;  
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
                        {...commonProps}
                        key={shape.id}
                        width={rect.width}
                        height={rect.height}
                        stroke={rect.fill}
                        offsetX={0}
                        offsetY={0}
                        strokeWidth={rect.strokeWidth}
                        dragBoundFunc={dragBoundFunc}
                      />
                    );
                  }
                  else if(shape.type === "SVG")
                  {
                    const svg = shape as SVGAttrs;
                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const stage = stageRef.current;
                      if (stage) {  
                        // Adjust for scaling and panning
                        const scale = stageScale;
                        const xOffset = stagePos.x;
                        const yOffset = stagePos.y;
                        const minX = (xOffset + svg.width/2) * scale;
                        const minY = (yOffset + svg.height/2) * scale;
                        const maxX = (CANVAS_WIDTH -  svg.width/2) * scale  + stagePos.x;
                        const maxY = (CANVAS_WIDTH -  svg.height/2) * scale  + stagePos.y;  
                        let x = pos.x;
                        let y = pos.y;
      
                        x = Math.max(minX, Math.min(x, maxX));
                        y = Math.max(minY, Math.min(y, maxY));
                        return { x, y};
                      }
                      return pos;
                    };
                    return(
                      svg.image !== null && (                     
                        <SVGShape
                          {...commonProps}
                          key={shape.id}
                          image={svg.image}                         
                          scaleX={svg.scaleX ? svg.scaleX : 1}
                          scaleY={svg.scaleY ? svg.scaleY : 1}
                          width={svg.width}
                          height={svg.height}
                          dragBoundFunc={dragBoundFunc}       
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
                        const scale = stageScale;
                        const xOffset = stagePos.x;
                        const yOffset = stagePos.y;
                        const minX = (xOffset+circle.radius) * scale;
                        const minY = (yOffset+circle.radius) * scale;
                        const maxX = (stageWidth-circle.radius) * scale   + stagePos.x;
                        const maxY = (stageHeight-circle.radius) * scale  + stagePos.x;
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
                        {...commonProps}  
                        key={shape.id}
                        radius={circle.radius}
                        fill={circle.fill}
                        dragBoundFunc={dragBoundFunc}
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
                        const scale = stageScale;
                        const xOffset = stagePos.x;
                        const yOffset = stagePos.y;
                        const minX = (xOffset + star.radius) * scale;
                        const minY = (yOffset + star.radius) * scale;
                        const maxX = (stageWidth - star.radius) * scale   + stagePos.x;
                        const maxY = (stageHeight  - star.radius) * scale  + stagePos.x;
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
                        {...commonProps}
                        key={shape.id}
                        numPoints={star.numPoints}
                        innerRadius={star.innerRadius}
                        outerRadius={star.radius}
                        fill={star.fill}
                        dragBoundFunc={dragBoundFunc}                       
                      />
                    );
                  }
                  else if (shape.type === "text") {
                    const text = shape as TextAttrs;
                    const dragBoundFunc = (pos: { x: number; y: number }) => {
                      const stage = stageRef.current;
                      if (stage) {
                        // Get the size of the visible area
                        const stageWidth = stage.width();
                        const stageHeight = stage.height();
                        const scale = stageScale;
                        const minX = 0;
                        const minY = 0;
                        const maxX = (stageWidth - 50) * scale   + stagePos.x;
                        const maxY = (stageHeight  - 50) * scale  + stagePos.x;
                        let x = pos.x;
                        let y = pos.y;
      
                        x = Math.max(minX, Math.min(x, maxX));
                        y = Math.max(minY, Math.min(y, maxY));
                        return { x, y};
                      }
                      return pos;
                    };
                    return (
                      <KonvaText
                        {...commonProps}   
                        key={shape.id}                      
                        text={text.text}
                        fontFamily={text.fontFamily}
                        fontSize={text.fontSize}
                        fill={text.fill}
                        dragBoundFunc={dragBoundFunc}                       
                      />
                    );
                  }
                  
                  return null;
                })
              );
              return elements;
            })()}

            {groupBoundingBox && (              
              <Rect
                x={(groupBoundingBox.x - stagePos.x) / stageScale}
                y={(groupBoundingBox.y - stagePos.y) / stageScale }
                width={groupBoundingBox.width / stageScale}
                height={groupBoundingBox.height / stageScale}
                fill="rgba(0,0,0,0)" // Fully transparent
                draggable
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                dragBoundFunc={(pos) => dragBoundFunc(pos, rectangleRef.current!)}
                onContextMenu={handleContextMenu}
                ref={rectangleRef}
              />
            )}
            
            {isSelecting && selectionRect && (
              <Rect
                fill="rgba(0,161,255,0.5)"
                // stroke= 'blue' // Line color
                // strokeWidth={2} // Line width
                x={(selectionRect.x- stagePos.x) / stageScale}
                y={(selectionRect.y- stagePos.y) / stageScale}
                width={selectionRect.width / stageScale}
                height={selectionRect.height / stageScale}
              />
            )}
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
          </Layer>  
          <Layer  name="tooltipLayer">
            {tooltipVisible && (
              <Label x={tooltipX} y={tooltipY}>
                <Tag
                  fill="black"
                  pointerDirection="down"
                  pointerWidth={10/stageScale}
                  pointerHeight={10/stageScale}
                  lineJoin="round"
                  shadowColor="black"
                  shadowBlur={10}
                  shadowOffsetX={10}
                  shadowOffsetY={10}
                  shadowOpacity={0.5}
                />
                <Text
                  text={tooltipText}
                  fontFamily="Calibri"
                  fontSize={18 /stageScale}
                  padding={5 /stageScale}
                  fill="white"
                />
              </Label>
            )}
          </Layer>
          <Layer name="crossfairLayer">
            {crossFair && showMouseInfo && (
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
        {menuPos && (
          <RightContext
            selectedIds={selectedIds}
            menuPosition={menuPos}
            onClose={handleCloseMenu}
            alignShapes={(alignment) => handleAlign(alignment)}
            handleDelete={deleteSelectedShapes}
            DistributeShapes={(direction) => DistributeShapes(direction)}
            flipSelectedShapesVertically={flipSelectedShapesVertically}
            flipSelectedShapesHorizontally={flipSelectedShapesHorizontally}
            toggleSnap={toggleSnap}
            snapEnabled={snapEnabled}
            handleCrossFair={HandleCrossFair}
            isCrossFair={crossFair}
            handleGridLine={HandleGridLine}
            gridLine={gridLine}
            handleGroup={handleGroup}
            areShapesGrouped={areShapesGrouped}
          />
        )}
      </div>
      {selectedIds.length > 0 && (
        <RightBar 
          handleSave={handleSave}
          handleInputChange={handleInputChange}
          handleGroupPositionChange={handleGroupPositionChange}
          selectedIds={selectedIds}
          groupPosition={groupPosition}
          getCommonProperty={getCommonProperty}
          selectedShapeTypes={selectedShapeTypes}
        />          
      )}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 10,
          padding: "0px",
        }}
      >
        <button onClick={handleUndo} disabled={!canUndo}>
          Undo
        </button>
        <button onClick={handleRedo} disabled={!canRedo}>
          Redo
        </button>
         <button style={{
          backgroundColor: "#4CAF50", // Green background
          marginLeft: "10px",
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
        <button style={{
          backgroundColor: "#4CAF50", // Green background
          marginLeft: "10px",
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
        onClick={saveAsJson}
        >Save as Json</button>
        {/* <label
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
        </label> */}
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
          Upload Json
          <input
            type="file"
            accept=".json"
            style={{
              display: "none", // Hide the default file input
            }}
            onChange={handleJsonChange} 
          />
        </label>
      </div>
      
    </div>
  );  
};  
export default Canvas;