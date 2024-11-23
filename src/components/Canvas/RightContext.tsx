import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAlignLeft, 
  faAlignRight, 
  faArrowUp, // Alternative for Align Top
  faArrowDown, // Alternative for Align Bottom
  faArrowsAltH, 
  faArrowsAltV, 
  faSyncAlt, 
  faTrash, 
  faGripHorizontal, 
  faGripVertical, 
  faBorderAll, 
  faBullseye 
} from '@fortawesome/free-solid-svg-icons';

interface CustomRightMenu {
  menuPosition: { x: number; y: number };
  snapEnabled: boolean;
  onClose: () => void;
  alignShapes: (alignment: 'left' | 'right' | 'top' | 'bottom') => void;
  DistributeShapes: (direction: 'horizontal' | 'vertical') => void;
  handleDelete: () => void;
  flipSelectedShapesVertically: () => void;
  flipSelectedShapesHorizontally: () => void;
  toggleSnap: () => void;
  handleCrossFair: () => void;
  isCrossFair: boolean;
  handleGridLine: () => void;
  gridLine: boolean;
}

const RightContext: React.FC<CustomRightMenu> = ({
  menuPosition,
  snapEnabled,
  isCrossFair,
  gridLine,
  onClose,
  alignShapes,
  DistributeShapes,
  handleDelete,
  flipSelectedShapesVertically,
  flipSelectedShapesHorizontally,
  toggleSnap,
  handleCrossFair,
  handleGridLine,
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
      <li
        onClick={() => alignShapes('left')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faAlignLeft} style={{ marginRight: '8px' }} />
        Align Left
      </li>
      <li
        onClick={() => alignShapes('right')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faAlignRight} style={{ marginRight: '8px' }} />
        Align Right
      </li>
      <li
        onClick={() => alignShapes('top')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faArrowUp} style={{ marginRight: '8px' }} />
        Align Top
      </li>
      <li
        onClick={() => alignShapes('bottom')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faArrowDown} style={{ marginRight: '8px' }} />
        Align Bottom
      </li>
      <li
        onClick={() => DistributeShapes('horizontal')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faArrowsAltH} style={{ marginRight: '8px' }} />
        Distribute Horizontal
      </li>
      <li
        onClick={() => DistributeShapes('vertical')}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faArrowsAltV} style={{ marginRight: '8px' }} />
        Distribute Vertical
      </li>
      <li
        onClick={flipSelectedShapesVertically}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faGripVertical} style={{ marginRight: '8px' }} />
        Flip Vertical
      </li>
      <li
        onClick={flipSelectedShapesHorizontally}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faGripHorizontal} style={{ marginRight: '8px' }} />
        Flip Horizontal
      </li>
      <li
        onClick={() => {
          handleCrossFair();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faBullseye} style={{ marginRight: '8px' }} />
        {isCrossFair ? 'Disable Crosshair' : 'Enable Crosshair'}
      </li>
      <li
        onClick={() => {
          handleGridLine();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faBorderAll} style={{ marginRight: '8px' }} />
        {gridLine ? 'Disable Gridlines' : 'Enable Gridlines'}
      </li>
      <li
        onClick={() => {
          toggleSnap();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '8px' }} />
        {snapEnabled ? 'Snap Enabled' : 'Snap Disabled'}
      </li>
      <li
        onClick={() => {
          handleDelete();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', color: 'red', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px' }} />
        Delete
      </li>
    </ul>
  );
};

export default RightContext;
