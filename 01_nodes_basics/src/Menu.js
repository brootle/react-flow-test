import React, { useState, useRef, useEffect, useContext } from 'react';

import { useStoreApi, useReactFlow } from 'reactflow';

import dagre from 'dagre';

import { MenuContext } from './MenuContext';

export default function Menu({nodeId}) {

  const store = useStoreApi();
  const { setNodes, setEdges, deleteElements, getNode } = useReactFlow();

  const nodeWidth = 280;
  const nodeHeight = 88;    

  // see https://react-flow.netlify.app/docs/api/react-flow-props/#event-handlers

  // the idea is to keep menu opened only if it matches node id

  const { openMenuId, setOpenMenuId } = useContext(MenuContext);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();

    if(showMenu){
      setShowMenu(false);
    } else{
      setShowMenu(true);      
      setOpenMenuId(nodeId)
    }
    
  };


  useEffect(() => {

    const handleClickOutside = (event) => {        
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // const menuItemClicked = (e) => {
  //   console.log("Menu item clicked: ", e.target)
  // }


  function adjustNodePositions(nodes, edges, threshold = 50) {
    const nodeById = nodes.reduce((acc, node) => {
      acc[node.id] = node;
      return acc;
    }, {});
  
    edges.forEach((edge) => {
      const source = nodeById[edge.source];
      const target = nodeById[edge.target];
  
      if (Math.abs(source.position.x - target.position.x) < threshold) {
        target.position.x = source.position.x;
      }
    });
  
    return nodes;
  }
  
  const animateNodeMovement = (startPositions, endPositions, duration, callback) => {
    const startTime = performance.now();

    const animationStep = () => {
      const elapsedTime = performance.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentPositions = startPositions
        .filter((start) => endPositions.some((end) => end.id === start.id))
        .map((start, index) => {
          const end = endPositions[index];
          return {
            id: start.id,
            x: start.x + progress * (end.x - start.x),
            y: start.y + progress * (end.y - start.y),
          };
        });
      setNodes((nodes) =>
        nodes.map((node) => {
          const currentPosition = currentPositions.find((pos) => pos.id === node.id);
          return currentPosition ? { ...node, position: { x: currentPosition.x, y: currentPosition.y } } : node;
        })
      );
      if (progress < 1) {
        requestAnimationFrame(animationStep);
      } else {
        if (callback && typeof callback === "function") {
          callback();
        }
      }
    };
    
    requestAnimationFrame(animationStep);
  };  

  // using dagre
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    //console.log("nodes: ", nodes)

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
      rankdir: direction,
        ranksep: 80, // Adjust this value to increase the vertical distance between nodes
        //nodesep: 230, // Adjust this value to increase the horizontal distance between nodes
        nodesep: 200, // Adjust this value to increase the horizontal distance between nodes
    });
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
  
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });
  
    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? 'left' : 'top';
      node.sourcePosition = isHorizontal ? 'right' : 'bottom';
  
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    });
  
    //return { nodes, edges };

    // Add the call to adjustNodePositions here
    const adjustedNodes = adjustNodePositions(nodes, edges);

    return { nodes: adjustedNodes, edges };

  };  

  const deleteNode = () => {

    const id = nodeId

    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });   
    
    // Check if the node with the specified ID already exists
    const nodeExists = nodes.some((node) => node.id === id);

    if (!nodeExists) {
      console.log(`Node with ID ${id} is not found.`);
      return;
    }    


    // Remove node with specified id
    const updatedNodes = nodes.filter((node) => node.id !== id);

    // Remove all edges associated with specified node
    const updatedEdges = edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    );
    
    // deleteElements
    const NodeToDelete = getNode(id)
    //console.log("NodeToDelete: ", NodeToDelete)
    deleteElements({nodes: [NodeToDelete]})
  
    // Get the start and end positions
    const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    const endPositions = getLayoutedElements(
      updatedNodes,
      updatedEdges
    ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // Animate node movement
    animateNodeMovement(startPositions, endPositions, 200, () => {
      setNodes([...updatedNodes]);
      setEdges([...updatedEdges]);
    });

       
  }  


  return (
    <div className='nodeMenu' ref={menuRef} onClick={toggleMenu}>
        <svg className='menuIcon' viewBox="0 0 20 20">
            <path d="M10.001 7.8a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 10 7.8zm-7 0a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 3 7.8zm14 0a2.2 2.2 0 1 0 0 4.402A2.2 2.2 0 0 0 17 7.8z" />
        </svg>   

        {showMenu && openMenuId === nodeId && (
            <div className="dropdown">
                {/* <div className="item">{nodeId}</div>    */}
                {/* <div className="item">{openMenuId}</div>   */}
                <div className="item">Menu Item 1</div>     
                <div className="item" onClick={deleteNode}>Delete Node</div>    
            </div>
        )}
    </div>
  );
}
