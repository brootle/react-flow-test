import React, { memo, useState, useEffect, useRef } from 'react';
import { useStoreApi, useReactFlow, Panel, MarkerType, getConnectedEdges, deleteElements } from 'reactflow';

import { Handle, NodeToolbar, Position } from 'reactflow';

// import { Tooltip } from 'react-tooltip' // see https://react-tooltip.com/docs/getting-started

import Menu from './Menu';

export default memo(({id, data }) => {
  const store = useStoreApi();
  const { setCenter, setNodes, setEdges, deleteElements, getNode, getEdge, getEdges, addEdges, addNodes } = useReactFlow();

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  // Handle input change
  const handleInputChange = (e) => {
    setEditedLabel(e.target.value);
  };

  // Handle "Edit Name" click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle "Save" button click
  const handleSaveClick = () => {
    //data.label = editedLabel;
    //setData({...data}); // This will trigger a re-render of the Node component
    // update this node here

    // not sure if code below is needed
    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        //delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });   
    
    // Check if the node with the specified ID already exists
    const nodeExists = nodes.some((node) => node.id === id);

    if (!nodeExists) {
      console.log(`Node with ID ${id} is not found.`);
      return;
    }    

    // Set the selected field of the specified node to true
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: {label: editedLabel},
        };
      }
      return node;
    });       

    setNodes([...updatedNodes]);
    // end of node update

    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  }


  const selectNode = () => {

    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        //delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });   
    
    // Check if the node with the specified ID already exists
    const nodeExists = nodes.some((node) => node.id === id);

    if (!nodeExists) {
      console.log(`Node with ID ${id} is not found.`);
      return;
    }    

    // Set the selected field of the specified node to true
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          selected: true,
          //selected: false,
        };
      }
      //return node;
      return {
        ...node,
        selected: false,
      };
    });       

    setNodes([...updatedNodes]);

  }

  return (
    <>
      <Handle 
        type="target"
      />
      {/* <div className='defaultNode' data-tooltip-id={`node_tooltip_${id}`} onMouseEnter={selectNode}> */}
      <div className='defaultNode' onMouseEnter={() => setIsTooltipVisible(true)} onMouseLeave={() => setIsTooltipVisible(false)}>
        { isEditing ?
          <div>
            <input className='nodrag nopan' type="text" value={editedLabel} onChange={handleInputChange} />
            <button onClick={handleSaveClick}>Save</button>
            <button onClick={handleCancelClick}>Cancel</button>
          </div>
        :
          <strong>{data.label}</strong>
        }
        <Menu nodeId={id} handleEditClick={handleEditClick} />
      </div>

      <NodeToolbar isVisible={isTooltipVisible} position={Position.Right}>
        <div className='nodeTooltip'>
          <h3>Tooltip for Node {id}</h3>
          <p>Here's some interesting stuff:</p>
          <ul>
            <li>Some</li>
            <li>Interesting</li>
            <li>Stuff</li>
          </ul>
        </div>
      </NodeToolbar>

      {/* <Tooltip id={`node_tooltip_${id}`}>
          <div>
            <h3>Tooltip for Node {id}</h3>
            <p>Here's some interesting stuff:</p>
            <ul>
              <li>Some</li>
              <li>Interesting</li>
              <li>Stuff</li>
            </ul>
          </div>
      </Tooltip> */}
      <Handle 
        type="source"
      />
    </>
  );
});