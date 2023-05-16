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

  const addNode = () => {
    // const position = { x: 0, y: 0 };  

    const { nodeInternals, edges } = store.getState();
    //console.log("nodeInternals: ", nodeInternals)
    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        delete normalizedNode.positionAbsolute;
        return normalizedNode;    
    });  
    // console.log("nodes: ", nodes)  

    // console.log("edges: ", edges)

    const newNodeId = '11'
    const source = '10'
    const target = '11'

    // Check if the node with the specified ID already exists
    const nodeExists = nodes.some((node) => node.id === newNodeId);

    if (nodeExists) {
      console.log(`Node with ID ${newNodeId} already exists.`);
      return;
    }    

    const newNode = {
      id: newNodeId,
      position: position,
      data: { label: `Node ${newNodeId}` },
      type: 'defaultNode'
    };

    const newEdge = {
      id: `${source}-${target}`,
      source: source,
      target: target,
      type: 'floating',
      markerEnd: { type: MarkerType.ArrowClosed }
    };    


    let newNodes = nodes.concat(newNode)
    //console.log("newNodes: ", newNodes)

    let newEdges = edges.concat(newEdge)
    //console.log("newEdges: ", newEdges)


    // add new node to layout screen 
    addNodes(newNode)

    // add new edge to layout screen
    addEdges(newEdge)

    // Get the start and end positions
    const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
    const endPositions = getLayoutedElements(
      newNodes,
      newEdges
    ).nodes.map((node) => ({ id: node.id, ...node.position }));

    // Animate node movement
    animateNodeMovement(startPositions, endPositions, 200, () => {
      setNodes([...newNodes]);
      setEdges([...newEdges]);
    });    

    // const newData = getLayoutedElements(
    //   newNodes,
    //   newEdges
    // );        

    // setNodes([...newData.nodes]);
    // setEdges([...newData.edges]);
  }  

  const deleteNode = () => {

    const id = "3"

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
        delete normalizedNode.positionAbsolute;
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
        delete normalizedNode.positionAbsolute;
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

  }  

  const removeLink = () => {

    const source = '6'
    const target = '4'

    const { nodeInternals, edges } = store.getState();

    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        delete normalizedNode.positionAbsolute;
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
        delete normalizedNode.positionAbsolute;
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

  return (
    <Panel position="top-right">
        <div>TODO: Panel</div>
        <div>
            <button onClick={focusNode}>Focus Node 1</button>
        </div>
        <div>
            <button onClick={addNode}>Add Node 11</button>
        </div>
        <div>
            <button onClick={linkNode}>Link 10 - 4</button>
        </div>
        <div>
            <button onClick={deleteNode}>Delete Node 3</button>
        </div> 
        <div>
            <button onClick={selectNode}>Select Node 2</button>
        </div>   
        <div>
            <button onClick={removeLink}>Remove link 6-4</button>
        </div>  
        <div>
            <button onClick={updateNode}>Update Node 2</button>
        </div>      
    </Panel>
  );
};