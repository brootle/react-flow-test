import React, { memo, useState, useEffect, useRef } from 'react';
import { useStoreApi, useReactFlow, Panel, MarkerType, getConnectedEdges, deleteElements } from 'reactflow';

import { Handle } from 'reactflow';

import Menu from './Menu';

export default memo(({id, data }) => {
  const store = useStoreApi();
  const { setCenter, setNodes, setEdges, deleteElements, getNode, getEdge, getEdges, addEdges, addNodes } = useReactFlow();

  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

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

  return (
    <>
      <Handle 
        type="target"
      />
      <div className='defaultNode'>
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
      <Handle 
        type="source"
      />
    </>
  );
});