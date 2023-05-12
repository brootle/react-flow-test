import React, {useCallback} from 'react';
import { useStoreApi, useReactFlow, Panel, MarkerType, getConnectedEdges, deleteElements } from 'reactflow';

import dagre from 'dagre';

// see https://reactflow.dev/docs/examples/layout/dagre/
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// see https://reactflow.dev/docs/examples/misc/use-react-flow-hook/

export default () => {
  const store = useStoreApi();
  const { setCenter, setNodes, setEdges } = useReactFlow();

//   console.log("store.getState(): ", store.getState())

  const nodeWidth = 280;
  const nodeHeight = 88;  

  // add coordinates to nodes
  const position = { x: 0, y: 0 }; 

  // using dagre
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {

    console.log("nodes: ", nodes)

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
      rankdir: direction,
        ranksep: 80, // Adjust this value to increase the vertical distance between nodes
        nodesep: 230, // Adjust this value to increase the horizontal distance between nodes
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
  
    return { nodes, edges };
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

    const newData = getLayoutedElements(
      newNodes,
      newEdges
    );        

    // //console.log("newData: ", newData)
    setNodes([...newData.nodes]);
    setEdges([...newData.edges]);

    //console.log("setNodes: ", setNodes)

  }  

  const onLayout = useCallback(
    (direction, nodes, edges) => {
      console.log("nodes: ", nodes)
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    []
  );  

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
    

    const newData = getLayoutedElements(
      updatedNodes,
      updatedEdges
    );        
  
    // setNodes(newData.nodes);
    // setEdges(newData.edges);      
    setNodes([...newData.nodes]);
    setEdges([...newData.edges]);    
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

    const newData = getLayoutedElements(
        nodes,
        newEdges
    );        
  
    setNodes([...newData.nodes]);
    setEdges([...newData.edges]);      
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
    </Panel>
  );
};