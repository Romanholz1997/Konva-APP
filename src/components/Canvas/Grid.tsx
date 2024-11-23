import React from 'react';
import { Stage, Layer, Line } from 'react-konva';

type GridProps = {
  width: number; // width of the canvas
  height: number; // height of the canvas
  cellSize: number; // size of each grid cell
  strokeColor?: string; // optional stroke color for the grid
  strokeWidth?: number; // optional stroke width for the grid lines
};

const Grid: React.FC<GridProps> = ({
  width,
  height,
  cellSize,
  strokeColor = 'lightgray',
  strokeWidth = 1,
}) => {
  const verticalLines = [];
  const horizontalLines = [];

  // Generate vertical lines
  for (let x = 0; x <= width; x += cellSize) {
    verticalLines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]} // Start and end points
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  // Generate horizontal lines
  for (let y = 0; y <= height; y += cellSize) {
    horizontalLines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]} // Start and end points
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <Layer>
      {verticalLines}
      {horizontalLines}
    </Layer>
  );
};

export default Grid;