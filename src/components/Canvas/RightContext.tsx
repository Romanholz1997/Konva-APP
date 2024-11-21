
import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import { KonvaEventObject } from "konva/lib/Node";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faAlignRight, faArrowAltCircleUp, faArrowAltCircleDown, faTrash, faArrowsAltH, faArrowsAltV, faGripLines } from '@fortawesome/free-solid-svg-icons';

interface CustomRightMenu {
    menuPosition: {x:  number, y: number};
    onClose: () => void;
    // onAlignLeft: () => void;
    alignShapes: (alignment:  'left' | 'right' | 'top' | 'bottom') => void;
    DistributeShapes: (direction: 'horizontal' | 'vertical') => void;
    // snapShapes: () => void;
    // setMenuPosition: (position: { x: number; y: number } | null) => void;
    handleDelete: () => void;
    flipSelectedShapesVertically: () => void;
    flipSelectedShapesHorizontally: () => void;
    toggleSnap: ()=> void;
    snapEnabled:boolean;
}
const RightContext: React.FC<CustomRightMenu> = ({
    menuPosition,
    snapEnabled,
    onClose,
    alignShapes,
    // alignShapes,
    DistributeShapes,
    // snapShapes,
    // setMenuPosition,
    handleDelete,
    flipSelectedShapesVertically,
    flipSelectedShapesHorizontally,
    toggleSnap
    
}) => {
  return (
    <ul
        style={{
        position: 'absolute',
        top: menuPosition.y,
        left: menuPosition.x,
        listStyle: 'none',
        padding: '10px',
        background: 'white',
        border: '1px solid black',
        zIndex: 1000,
        }}
        onMouseLeave={() => onClose()}
    >
        <li onClick={() => alignShapes("left")} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}>
        <FontAwesomeIcon icon={faAlignLeft} style={{ marginRight: '8px' }} />
        Align Left
        </li>
        <li onClick={() => alignShapes("right")} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faAlignRight} style={{ marginRight: '8px' }} />
        Align Right
        </li>
        <li  onClick={() => alignShapes("top")} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faArrowAltCircleUp} style={{ marginRight: '8px' }} />
        Align Top
        </li>
        <li  onClick={() => alignShapes("bottom")} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faArrowAltCircleDown} style={{ marginRight: '8px' }} />
        Align Bottom
        </li>
        <li onClick={() => DistributeShapes("horizontal")}  style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faArrowsAltH} style={{ marginRight: '8px' }} />
        Distribute Horizontal
        </li>
        <li onClick={() => DistributeShapes("vertical")} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faArrowsAltV} style={{ marginRight: '8px' }} />
        Distribute Vertical
        </li>
        <li onClick={ flipSelectedShapesVertically} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faGripLines} style={{ marginRight: '8px' }} />
         Flip Vertical
        </li>
        <li onClick={ flipSelectedShapesHorizontally} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faGripLines} style={{ marginRight: '8px' }} />
          Flip Horizontal
        </li>
        <li onClick={ () => {toggleSnap(); onClose();}} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faGripLines} style={{ marginRight: '8px' }} />
        {snapEnabled ? "Snap Enabled": "Snap Disabled"}
        </li>
        <li onClick={() => {handleDelete(); onClose()}} style={{ display: 'flex', alignItems: 'center', padding: '5px', color: 'red', cursor: 'pointer'  }}>
        <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }} />
        Delete
        </li>
    </ul>
  );
};

export default RightContext;