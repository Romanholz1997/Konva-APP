import React from "react";
import { Line, Text } from "react-konva";

const Ruler: React.FC<{
  orientation: "horizontal" | "vertical";
  length: number;
  tickSpacing: number;
}> = ({ orientation, length, tickSpacing }) => {
  const ticks = [];
  const labels = [];

  for (let i = 0; i <= length; i += tickSpacing) {
    // Draw ticks
    if (orientation === "horizontal") {
      ticks.push(
        <Line
          key={`tick-${i}`}
          points={[i, 0, i, 10]} // Horizontal ticks
          stroke="black"
        />
      );
      // Add labels every 10th tick
      if (i % (tickSpacing * 10) === 0) {
        labels.push(
          <Text
            key={`label-${i}`}
            text={`${i / tickSpacing}`}
            x={i}
            y={15}
            fontSize={10}
            fill="black"
          />
        );
      }
    } else {
      ticks.push(
        <Line
          key={`tick-${i}`}
          points={[0, i, 10, i]} // Vertical ticks
          stroke="black"
        />
      );
      // Add labels every 10th tick
      if (i % (tickSpacing * 10) === 0) {
        labels.push(
          <Text
            key={`label-${i}`}
            text={`${i / tickSpacing}`}
            x={15}
            y={i}
            fontSize={10}
            fill="black"
          />
        );
      }
    }
  }

  return (
    <>
      {ticks}
      {labels}
    </>
  );
};

export default Ruler;
