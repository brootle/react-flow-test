import React, {useCallback} from 'react';
import { useStoreApi, useReactFlow, Panel, MarkerType, getConnectedEdges, deleteElements } from 'reactflow';

import dagre from 'dagre';

// see https://reactflow.dev/docs/examples/layout/dagre/
// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

// see https://reactflow.dev/docs/examples/misc/use-react-flow-hook/

//import { forceSimulation, forceManyBody, forceY, forceX } from 'd3-force';


export default () => {
  const store = useStoreApi();
  const { setCenter, setNodes, setEdges, deleteElements, getNode, getEdge, getEdges, addEdges, addNodes } = useReactFlow();

//   console.log("store.getState(): ", store.getState())

  const nodeWidth = 280;
  const nodeHeight = 88;  

  // add coordinates to nodes
  const position = { x: 0, y: 0 }; 

  // function createForceLayout(nodes) {
  //   const simulation = forceSimulation(nodes)
  //     .force("charge", forceManyBody().strength(-50))
  //     .force("forceX", forceX().strength(0.1))
  //     .stop();
  
  //   for (let i = 0; i < 100; ++i) simulation.tick(); // Increase or decrease the number of ticks to adjust the simulation's effect
  
  //   nodes.forEach((node) => {
  //     node.position.x = node.x;
  //   });
  
  //   return nodes;
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


  const focusNode = () => {
    const { nodeInternals } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => node);

    if (nodes.length > 0) {
      const node = nodes[0];

      const x = node.position.x + node.width / 2;
      const y = node.position.y + node.height / 2;
      const zoom = 1.85;

      setCenter(x, y, { zoom, duration: 1000 });
    }
  };

  const focusNodeById = (id) => {

    console.log("Focus on node: ", id)

    const { nodeInternals } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => node);

    const node = nodes.find(node => node.id === id);

    const x = node.position.x + node.width / 2;
    const y = node.position.y + node.height / 2;
    const zoom = 1.85;

    setCenter(x, y, { zoom, duration: 1000 });
  };

  // const addNode = () => {
  //   // const position = { x: 0, y: 0 };  

  //   const { nodeInternals, edges } = store.getState();
  //   const nodes = Array.from(nodeInternals).map(([, node]) => {
  //       const normalizedNode = { ...node };
  //       return normalizedNode;    
  //   });  

  //   const newNodeId = '11'
  //   const source = '10'
  //   const target = '11'

  //   // Check if the node with the specified ID already exists
  //   const nodeExists = nodes.some((node) => node.id === newNodeId);

  //   if (nodeExists) {
  //     console.log(`Node with ID ${newNodeId} already exists.`);
  //     return;
  //   }    

  //   const newNode = {
  //     id: newNodeId,
  //     position: position,
  //     data: { label: `Node ${newNodeId}` },
  //     type: 'defaultNode'
  //   };

  //   const newEdge = {
  //     id: `${source}-${target}`,
  //     source: source,
  //     target: target,
  //     type: 'floating',
  //     markerEnd: { type: MarkerType.ArrowClosed }
  //   };    


  //   let newNodes = nodes.concat(newNode)
  //   //console.log("newNodes: ", newNodes)

  //   let newEdges = edges.concat(newEdge)
  //   //console.log("newEdges: ", newEdges)


  //   // add new node to layout screen 
  //   addNodes(newNode)

  //   // add new edge to layout screen
  //   addEdges(newEdge)

  //   // Get the start and end positions
  //   const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
  //   const endPositions = getLayoutedElements(
  //     newNodes,
  //     newEdges
  //   ).nodes.map((node) => ({ id: node.id, ...node.position }));

  //   // Animate node movement
  //   animateNodeMovement(startPositions, endPositions, 200, () => {
  //     setNodes([...newNodes]);
  //     setEdges([...newEdges]);
  //   });    
  // }  

//   const addNode = () => {

//     const { nodeInternals, edges } = store.getState();
//     const nodes = Array.from(nodeInternals).map(([, node]) => {
//         const normalizedNode = { ...node };
//         return normalizedNode;    
//     });  
  
//     const newNodeId = '11'
//     const source = '10'
//     const target = '11'
  
//     // Check if the node with the specified ID already exists
//     const nodeExists = nodes.some((node) => node.id === newNodeId);
//     const sourceNodeExists = nodes.some((node) => node.id === source);
  
//     if (nodeExists) {
//       console.log(`Node with ID ${newNodeId} already exists.`);
//       return;
//     }    
  
//     const newNode = {
//       id: newNodeId,
//       position: position,
//       data: { label: `Node ${newNodeId}` },
//       type: 'defaultNode'
//     };
  
//     let newNodes = nodes.concat(newNode)
  
//     // add new node to layout screen 
//     addNodes(newNode)
  
//     if (sourceNodeExists) {
//       const newEdge = {
//         id: `${source}-${target}`,
//         source: source,
//         target: target,
//         type: 'floating',
//         markerEnd: { type: MarkerType.ArrowClosed }
//       };
  
//       let newEdges = edges.concat(newEdge)
  
//       // add new edge to layout screen
//       addEdges(newEdge)
  
//       // Get the start and end positions
//       const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
//       const endPositions = getLayoutedElements(
//         newNodes,
//         newEdges
//       ).nodes.map((node) => ({ id: node.id, ...node.position }));
  
//       // Animate node movement
//       animateNodeMovement(startPositions, endPositions, 200, () => {
//         setNodes([...newNodes]);
//         setEdges([...newEdges]);
//       });
//     } else {
//       console.log(`Source node with ID ${source} does not exist.`);
//       setNodes([...newNodes]); // only update nodes if there's no source node to form an edge
//     }
//   }
  

  const deleteNode = () => {

    const id = "3"

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




    // // Set the updated nodes and edges, effectively removing the deleted node and associated edges instantly
    // setNodes([...updatedNodes]);
    // setEdges([...updatedEdges]);

    // // Get the start and end positions
    // const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    // const endPositions = getLayoutedElements(
    //   updatedNodes,
    //   updatedEdges
    // ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // // Animate node movement
    // animateNodeMovement(startPositions, endPositions, 1000);    


    

    // const newData = getLayoutedElements(
    //   updatedNodes,
    //   updatedEdges
    // );      
 
    // setNodes([...newData.nodes]);
    // setEdges([...newData.edges]);        
  }

  const linkNode = () => {
    const source = '10'
    const target = '4'

    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        //delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });  

    // Check if the edge with the specified ID already exists
    const edgeExists = edges.some((edge) => edge.id === `${source}-${target}`);

    if (edgeExists) {
      console.log(`Edge with ID ${source}-${target} already exists.`);
      return;
    }    


    const newEdge = {
        id: `${source}-${target}`,
        source: source,
        target: target,
        type: 'floating',
        markerEnd: { type: MarkerType.ArrowClosed }
    };   

    let newEdges = edges.concat(newEdge)

    // add new edge to layout screen
    addEdges(newEdge)
  
    // Get the start and end positions
    const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    const endPositions = getLayoutedElements(
      nodes,
      newEdges
    ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // Animate node movement
    animateNodeMovement(startPositions, endPositions, 200, () => {
      setNodes([...nodes]);
      setEdges([...newEdges]);
    });    

    // const newData = getLayoutedElements(
    //     nodes,
    //     newEdges
    // );        
  
    // setNodes([...newData.nodes]);
    // setEdges([...newData.edges]);        
  }

  const selectNode = () => {

    const id = "2"

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
        };
      }
      return node;
    });       

    setNodes([...updatedNodes]);

    focusNodeById(id)

  }  

  const removeLink = () => {

    const source = '6'
    const target = '4'

    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        //delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });  

    // Check if the edge with the specified ID already exists
    const edgeExists = edges.some((edge) => edge.id === `${source}-${target}`);

    if(!edgeExists) {
      console.log(`Edge with ID ${source}-${target} does not exists.`);
      return;
    }      

    // Remove the edge with the specified source and target
    const updatedEdges = edges.filter((edge) => edge.id !== `${source}-${target}`);

    // deleteElements
    const EdgeToDelete = getEdge(`${source}-${target}`)
    deleteElements({edges: [EdgeToDelete]})    
        

    // Get the start and end positions
    const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    const endPositions = getLayoutedElements(
      nodes,
      updatedEdges
    ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // Animate node movement
    animateNodeMovement(startPositions, endPositions, 200, () => {
      setNodes([...nodes]);
      setEdges([...updatedEdges]);
    });


  }  

  // update node https://reactflow.dev/docs/examples/nodes/update-node/

  const updateNode = () => {

    const id = "2"

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
          data: {label: "Updated"},
        };
      }
      return node;
    });       

    setNodes([...updatedNodes]);

  }    

//   const onDragStart = (event, data) => {
//     event.dataTransfer.setData('application/reactflow', JSON.stringify(data));
//     event.dataTransfer.effectAllowed = 'move';
//   };


//   const addNode = ({id, source, target}) => {

//     console.log("id: ", id)
//     console.log("source: ", source)
//     console.log("target: ", target)

//     const { nodeInternals, edges } = store.getState();
//     const nodes = Array.from(nodeInternals).map(([, node]) => {
//         const normalizedNode = { ...node };
//         return normalizedNode;    
//     });  
  
//     //const id = '11'
//     // const source = '10'
//     // const target = '11'
  
  
//     // Check if the node with the specified ID already exists
//     const nodeExists = nodes.some((node) => node.id === id);
//     const sourceNodeExists = nodes.some((node) => node.id === source);
  
//     if (nodeExists) {
//       console.log(`Node with ID ${id} already exists.`);
//       return;
//     }    
  
//     const newNode = {
//       id: id,
//       position: position,
//       data: { label: `Node ${id}` },
//       type: 'defaultNode'
//     };
  
//     console.log("newNode: ", newNode)

//     let newNodes = nodes.concat(newNode)
  
//     // add new node to layout screen 
//     addNodes(newNode)
  
//     if (sourceNodeExists) {
//       const newEdge = {
//         id: `${source}-${target}`,
//         source: source,
//         target: target,
//         type: 'floating',
//         markerEnd: { type: MarkerType.ArrowClosed }
//       };
  
//       let newEdges = edges.concat(newEdge)
  
//       // add new edge to layout screen
//       addEdges(newEdge)
  
//       // Get the start and end positions
//       const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
//       const endPositions = getLayoutedElements(
//         newNodes,
//         newEdges
//       ).nodes.map((node) => ({ id: node.id, ...node.position }));
  
//       // Animate node movement
//       animateNodeMovement(startPositions, endPositions, 200, () => {
//         setNodes([...newNodes]);
//         setEdges([...newEdges]);
//       });
//     } else {
//         console.log(`Source node with ID ${source} does not exist.`);
//         //setNodes([...newNodes]); // only update nodes if there's no source node to form an edge
  
//         let newEdges = edges
  
//         // Get the start and end positions
//         const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
//         const endPositions = getLayoutedElements(
//           newNodes,
//           newEdges
//         ).nodes.map((node) => ({ id: node.id, ...node.position }));
    
//         // Animate node movement
//         animateNodeMovement(startPositions, endPositions, 200, () => {
//           setNodes([...newNodes]);
//           setEdges([...newEdges]);
//         });    
//     }
//   }

const addNode = ({id, source, target}) => {
    const { nodeInternals, edges } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => ({ ...node }));

    // Check if the node with the specified ID already exists
    if (nodes.some((node) => node.id === id)) {
      console.log(`Node with ID ${id} already exists.`);
      return;
    } 

    const newNode = {
      id: id,
      position: position,
      data: { label: `Node ${id}` },
      type: 'defaultNode'
    };

    const newNodes = [...nodes, newNode];
  
    // add new node to layout screen 
    addNodes(newNode)
  
    // Check if the source node exists
    const sourceNodeExists = nodes.some((node) => node.id === source);
  
    let newEdges = [...edges];

    if (sourceNodeExists) {
      const newEdge = {
        id: `${source}-${target}`,
        source: source,
        target: target,
        type: 'floating',
        markerEnd: { type: MarkerType.ArrowClosed }
      };

      newEdges = [...newEdges, newEdge];
  
      // add new edge to layout screen
      addEdges(newEdge)
    } else {
      console.log(`Source node with ID ${source} does not exist.`);
    }

    // Get the start and end positions
    const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    const endPositions = getLayoutedElements(
      newNodes,
      newEdges
    ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // Animate node movement
    animateNodeMovement(startPositions, endPositions, 200, () => {
      setNodes(newNodes);
      setEdges(newEdges);
    });
}


  return (
    <Panel position="top-right">
      <div className='nodePanel'>
        <div className='nodePanelTitle'>Node panel</div>
        {/* <div className='nodePanelBody'>
            <div className='nodePanelBody__node' onDragStart={(event) => onDragStart(event, { id: '12', data: { label: 'Node 12' }, type: 'defaultNode' })} draggable>Upload File</div>
            <div className='nodePanelBody__node' onDragStart={(event) => onDragStart(event, { id: '13', data: { label: 'Node 13' }, type: 'defaultNode' })} draggable>Storage</div>
            <div className='nodePanelBody__node' onDragStart={(event) => onDragStart(event, { id: '14', data: { label: 'Node 14' }, type: 'defaultNode' })} draggable>Artificial Intelligence</div>
            <div className='nodePanelBody__node' onDragStart={(event) => onDragStart(event, { id: '15', data: { label: 'Node 15' }, type: 'defaultNode' })} draggable>Transcoding</div>
            <div className='nodePanelBody__node' onDragStart={(event) => onDragStart(event, { id: '16', data: { label: 'Node 16' }, type: 'defaultNode' })} draggable>Live Streaming</div>
        </div> */}

        <div className='nodePanelBody'>
            <div className='nodePanelBody__node'>
                <div className='nodePanelBody__node-header'>
                    <div>Upload File</div>
                    <button onClick={() => addNode({id: '12'})}>Add</button>                    
                </div>
                <div className='nodePanelBody__node-comment'>id 12, not linked</div>
            </div>
            <div className='nodePanelBody__node'>
                <div className='nodePanelBody__node-header'>
                    <div>Storage</div>
                    <button onClick={() => addNode({id: '13', source: '9', target: '13'})}>Add</button>                  
                </div>
                <div className='nodePanelBody__node-comment'>id 13, linked to 9</div>
            </div>
            <div className='nodePanelBody__node'>
                <div className='nodePanelBody__node-header'>
                    <div>Artificial Intelligence</div>
                    <button onClick={() => addNode({id: '14', source: '7', target: '14'})}>Add</button>                    
                </div>
                <div className='nodePanelBody__node-comment'>id 14, linked to 7</div>
            </div>
            <div className='nodePanelBody__node'>
                <div className='nodePanelBody__node-header'>
                    <div>Transcoding</div>
                    <button onClick={() => addNode({id: '15', source: '12', target: '15'})}>Add</button>                  
                </div>
                <div className='nodePanelBody__node-comment'>id 15, linked to 12</div>
            </div>
            <div className='nodePanelBody__node'>
                <div className='nodePanelBody__node-header'>
                    <div>Live Streaming</div>
                    <button onClick={() => addNode({id: '16', source: '4', target: '16'})}>Add</button>                  
                </div>
                <div className='nodePanelBody__node-comment'>id 16, linked to 4</div>
            </div>
        </div>        

      </div>
     
    </Panel>
  );
};