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
  faPlus  ,
  faUserFriends,
  faCut,
  faPaste,
  faLocationCrosshairs
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
  selectedIds: string[];
  handleGroup: () => void;
  areShapesGrouped: () => boolean;
  handleCut: () => void;
  handlePaste: () => void;
  isCut: boolean;
  handleLocation: () => void;
  isLocation: number;
}

const RightContext: React.FC<CustomRightMenu> = ({
  menuPosition,
  snapEnabled,
  isCrossFair,
  gridLine,
  selectedIds,
  onClose,
  alignShapes,
  DistributeShapes,
  handleDelete,
  flipSelectedShapesVertically,
  flipSelectedShapesHorizontally,
  toggleSnap,
  handleCrossFair,
  handleGridLine,
  handleGroup,
  areShapesGrouped,
  handleCut,
  handlePaste,
  isCut,
  handleLocation,
  isLocation
}) => {
  const menuWidth = 200;
  const menuHeight = 550;

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let x = 0;
  let y = 0;
  if(selectedIds.length > 0)
  {
     x = (menuPosition.x + 25) + menuWidth > viewportWidth ? (menuPosition.x - 25) - menuWidth : (menuPosition.x + 25);
     y = (menuPosition.y + 10) + menuHeight > viewportHeight ? (menuPosition.y + 10) - (menuPosition.y  + menuHeight  - viewportHeight) : (menuPosition.y + 10);
  }
  else 
  {
    x = (menuPosition.x + 25) + menuWidth > viewportWidth ? (menuPosition.x - 25) - menuWidth : (menuPosition.x + 25);
    y = (menuPosition.y + 10) + 200 > viewportHeight ? (menuPosition.y + 60) - 200 : (menuPosition.y + 10);
  }
  return (
    <ul
      style={{
        position: 'absolute',
        width:'200px',
        top: y,
        left: x,
        listStyle: 'none',
        padding: '10px',
        background: 'white',
        border: '1px solid black',
        zIndex: 1000,
      }}
      onMouseLeave={() => onClose()}
    >
      {/* <li  style={{alignItems: 'center', padding: '5px', cursor: 'pointer' }}>
        <strong>Selected Shapes:</strong> {selectedIds.join(', ')}
      </li>  */}
      {selectedIds.length > 0 && <>
        <li
          onClick={() => alignShapes('left')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faAlignLeft} style={{ marginRight: '8px', width:'15px'  }} />
          Align Left
        </li>
        <li
          onClick={() => alignShapes('right')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faAlignRight} style={{ marginRight: '8px', width:'15px'  }} />
          Align Right
        </li>
        <li
          onClick={() => alignShapes('top')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faArrowUp} style={{ marginRight: '8px', width:'15px'  }} />
          Align Top
        </li>
        <li
          onClick={() => alignShapes('bottom')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faArrowDown} style={{ marginRight: '8px', width:'15px'  }} />
          Align Bottom
        </li>
        <li
          onClick={() => DistributeShapes('horizontal')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faArrowsAltH} style={{ marginRight: '8px', width:'15px'  }} />
          Distribute Horizontal
        </li>
        <li
          onClick={() => DistributeShapes('vertical')}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faArrowsAltV} style={{ marginRight: '8px', width:'15px'  }} />
          Distribute Vertical
        </li>
        <li
          onClick={() =>{
            handleGroup(); // Update the state and handle group
            onClose();
          }}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faUserFriends} style={{ marginRight: '8px', width:'15px' }} />
          {areShapesGrouped() ? 'Ungroup' : 'Group'}
        </li>
        <li
          onClick={flipSelectedShapesVertically}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faGripVertical} style={{ marginRight: '8px', width:'15px'  }} />
          Flip Vertical
        </li>
        <li
          onClick={flipSelectedShapesHorizontally}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faGripHorizontal} style={{ marginRight: '8px', width:'15px'  }} />
          Flip Horizontal
        </li>
        <li
          onClick={handleCut}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faCut} style={{ marginRight: '8px', width:'15px'  }} />
          Cut (Ctrl + X)
        </li>        
      </>
      }
      {isCut && 
        <li
          onClick={handlePaste}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faPaste} style={{ marginRight: '8px', width:'15px'  }} />
          Paste (Ctrl + V)
        </li>
      }      
      <li
        onClick={() => {
          handleCrossFair();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faPlus  } style={{ marginRight: '8px', width:'15px'  }} />
        {isCrossFair ? 'Disable Crosshair' : 'Enable Crosshair'}
      </li>
      <li
        onClick={() => {
          handleGridLine();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faBorderAll} style={{ marginRight: '8px', width:'15px'  }} />
        {gridLine ? 'Disable Gridlines' : 'Enable Gridlines'}
      </li>
      <li
        onClick={() => {
          toggleSnap();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: '8px', width:'15px'  }} />
        {snapEnabled ? 'Snap Enabled' : 'Snap Disabled'}
      </li>
      <li
        onClick={() => {
          handleLocation();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} style={{ marginRight: '8px', width:'15px'  }} />
        {isLocation === 0 ?  'All' : isLocation === 1 ? 'Location' : 'Locate'}
      </li>
      <li
        onClick={() => {
          handleCrossFair();
          onClose();
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}
      >
        <FontAwesomeIcon icon={faPlus  } style={{ marginRight: '8px', width:'15px'  }} />
        {isCrossFair ? 'Disable Crosshair' : 'Enable Crosshair'}
      </li>
      {selectedIds.length > 0 && <li
          onClick={() => {
            handleDelete();
            onClose();
          }}
          style={{ display: 'flex', alignItems: 'center', padding: '5px', color: 'red', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faTrash} style={{ marginRight: '8px', width:'15px'  }} />
          Delete
        </li>
      }
    </ul>
  );
};

export default RightContext;
