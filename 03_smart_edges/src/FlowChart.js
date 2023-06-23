// import React, { useCallback, useEffect } from 'react';
import React, { useCallback, useState  } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  //Panel,
  MarkerType,
  //ReactFlowProvider,
  useReactFlow,
  useStoreApi
} from 'reactflow';

import { SmartBezierEdge, SmartStepEdge } from '@tisoap/react-flow-smart-edge'

import 'reactflow/dist/style.css';

import './index.css';

import FloatingEdge from './FloatingEdge.js';
import FloatingConnectionLine from './FloatingConnectionLine.js';

import DeafaultNode from './DeafaultNode';

import ControlPanel from './ControlPanel';
import NodePanel from './NodePanel';

import dagre from 'dagre';

import { MenuContext } from './MenuContext';

import { Tooltip } from 'react-tooltip'

// // see https://reactflow.dev/docs/examples/layout/dagre/
// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

const edgeTypes = {
  floating: FloatingEdge,
  smart: SmartStepEdge
  //smart: SmartBezierEdge
};

const nodeTypes = {
  defaultNode: DeafaultNode
};

const proOptions = { hideAttribution: true };

export default function App({initialNodes, initialEdges}) {

  const store = useStoreApi();
  const { setCenter, addEdges, addNodes } = useReactFlow();

  //const reactFlowInstance = useRef(null);

  // const nodeWidth = 172;
  // const nodeHeight = 36;

  const nodeWidth = 280;
  const nodeHeight = 88;  
  
  // add coordinates to nodes
  const position = { x: 0, y: 0 };  

  const addPositionToNodes = (nodes, position) => {
    return nodes.map(node => ({ ...node, position }));
  };
  
  const nodesWithPosition = addPositionToNodes(initialNodes, position);

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

  // const animateNodeMovement = (startPositions, endPositions, duration, callback) => {
  //   const startTime = performance.now();

  //   const animationStep = () => {
  //     const elapsedTime = performance.now() - startTime;
  //     const progress = Math.min(elapsedTime / duration, 1);
  //     const currentPositions = startPositions
  //       .filter((start) => endPositions.some((end) => end.id === start.id))
  //       .map((start, index) => {
  //         const end = endPositions[index];
  //         return {
  //           id: start.id,
  //           x: start.x + progress * (end.x - start.x),
  //           y: start.y + progress * (end.y - start.y),
  //         };
  //       });
  //     setNodes((nodes) =>
  //       nodes.map((node) => {
  //         const currentPosition = currentPositions.find((pos) => pos.id === node.id);
  //         return currentPosition ? { ...node, position: { x: currentPosition.x, y: currentPosition.y } } : node;
  //       })
  //     );
  //     if (progress < 1) {
  //       requestAnimationFrame(animationStep);
  //     } else {
  //       if (callback && typeof callback === "function") {
  //         callback();
  //       }
  //     }
  //   };
    
  //   requestAnimationFrame(animationStep);
  // };    


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

    // see https://reactflow.dev/docs/examples/layout/dagre/
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ 
      rankdir: direction,
      ranksep: 80, // Adjust this value to increase the vertical distance between nodes
      //nodesep: 230, // Adjust this value to increase the horizontal distance between nodes
      nodesep: 200,
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
  
    // return { nodes, edges };
    const adjustedNodes = adjustNodePositions(nodes, edges);

    return { nodes: adjustedNodes, edges };
  };


  // add edge type
  const addTypeToEdges = (edges, edgeType) => {
    return edges.map(edge => ({ ...edge, type: edgeType }));
  };

  //const edgesWithType = addTypeToEdges(initialEdges, 'smoothstep');

  const edgesWithType = addTypeToEdges(initialEdges, 'floating');

  //const edgesWithType = addTypeToEdges(initialEdges, 'smart');

  const addMarkerToEdge = (edges, MarkerType) => {
    return edges.map(edge => ({ ...edge, markerEnd: { type: MarkerType, }, }));
  };

  const edgesWithMarker = addMarkerToEdge(edgesWithType, MarkerType.ArrowClosed);

  //console.log("edgesWithMarker: ", edgesWithMarker)

  // initial set

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodesWithPosition,
    edgesWithType
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithPosition);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesWithMarker);

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.ArrowClosed } }, eds)
      ),
    [setEdges]
  );

  // const onConnect = useCallback(
  //   (params) =>
  //     setEdges((eds) =>
  //       addEdge({ ...params, type: 'smart', markerEnd: { type: MarkerType.ArrowClosed } }, eds)
  //     ),
  //   [setEdges]
  // );  

  const [openMenuId, setOpenMenuId] = useState(null);

  const handleClickedOutsideOfMenu = useCallback(() => {
    //console.log("close all open menu")
    setOpenMenuId(null)
  }, []);  

  // this can be used when there are changes to nodes or edges
  // function logChange({ type, ...rest }) {
  //   //console.log(`CHANGE: ${type}`, rest);
  //   if(type === 'remove'){

  //     const {id} = rest

  //     // Remove node with specified id
  //     const updatedNodes = nodes.filter((node) => node.id !== id);

  //     // Remove all edges associated with specified node
  //     const updatedEdges = edges.filter(
  //       (edge) => edge.source !== id && edge.target !== id
  //     );
      
  //     // Get the start and end positions
  //     const startPositions = nodes.map((node) => ({ id: node.id, ...node.position }));
  //     const endPositions = getLayoutedElements(
  //       updatedNodes,
  //       updatedEdges
  //     ).nodes.map((node) => ({ id: node.id, ...node.position }));

  //     // Animate node movement
  //     animateNodeMovement(startPositions, endPositions, 200, () => {
  //       setNodes([...updatedNodes]);
  //       setEdges([...updatedEdges]);
  //     });

  //   }
  // }

  // const findFirstSelectedId = (arr) => {
  //     const selectedElement = arr.find((element) => element.selected === true);
  //     return selectedElement ? selectedElement.id : null;
  // }  

  const focusNodeById = (id) => {
    const { nodeInternals } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => node);

    const node = nodes.find(node => node.id === id);

    //console.log("node: ", node)

    const x = node.position.x + node.width / 2;
    const y = node.position.y + node.height / 2;
    const zoom = 1.85;

    setCenter(x, y, { zoom, duration: 1000 });
    
    //reactFlowInstance.current.setCenter(x, y, { zoom, duration: 1000 });
  };

  const addNode = ({id, source, target}) => {

    const { nodeInternals, edges } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => {
        const normalizedNode = { ...node };
        return normalizedNode;    
    });  
    
    // Check if the node with the specified ID already exists
    const nodeExists = nodes.some((node) => node.id === id);
    const sourceNodeExists = nodes.some((node) => node.id === source);
  
    if (nodeExists) {
      console.log(`Node with ID ${id} already exists.`);
      return;
    }    
  
    const newNode = {
      id: id,
      position: position,
      data: { label: `Node ${id}` },
      type: 'defaultNode'
    };
  
    let newNodes = nodes.concat(newNode)
  
    // add new node to layout screen 
    addNodes(newNode)
  
    if (sourceNodeExists) {
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
        newNodes,
        newEdges
      ).nodes.map((node) => ({ id: node.id, ...node.position }));
  
      // Animate node movement
      animateNodeMovement(startPositions, endPositions, 200, () => {
        setNodes([...newNodes]);
        setEdges([...newEdges]);
      });
    } else {
      console.log(`Source node with ID ${source} does not exist.`);
      //setNodes([...newNodes]); // only update nodes if there's no source node to form an edge

      let newEdges = edges

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
    }
  }  

  // const onDragOver = useCallback((event) => {
  //   event.preventDefault();
  //   event.dataTransfer.dropEffect = 'move';
  // }, []);

  // const onDrop = useCallback(
  //   (event) => {
  //     event.preventDefault();

  //     const data = event.dataTransfer.getData('application/reactflow');

  //     let parsedData = JSON.parse(data);
      
  //     console.log("data: ", parsedData)

  //     // extracting type from parsedData
  //     let {type, id} = parsedData;


  //     // check if the dropped element is valid
  //     if (typeof type === 'undefined' || !type) {
  //       return;
  //     }      

  //     console.log("add new node: ", type)
  //     addNode({
  //       id,
  //       source: "2",
  //       target: `${id}`
  //     })
  //   }
  // );


  return (
    <MenuContext.Provider value={{openMenuId, setOpenMenuId }}>
      <div className="floatingedges">
        {/* <ReactFlowProvider> */}
          <ReactFlow

              // onInit={(instance) => {
              //   reactFlowInstance.current = instance;
              // }}

              nodes={nodes}
              edges={edges}
              //onNodesChange={onNodesChange}
              onNodesChange={(changes) => {

                onNodesChange(changes);
                //console.log("changes: ", changes)
                
                changes.forEach(change => {
                  if(change?.type === "select" && change?.selected && change?.id){
                    focusNodeById(change.id)
                    return
                  }
                })

              }}
              onEdgesChange={onEdgesChange}
              // onEdgesChange={(changes) => {
              //   onEdgesChange(changes);
              //   //changes.forEach(logChange);
              //   //console.log("changes: ", changes)
              // }}              
              onConnect={onConnect}
              fitView
              edgeTypes={edgeTypes}
              nodeTypes={nodeTypes}
              connectionLineComponent={FloatingConnectionLine}
              proOptions={proOptions}
              // onNodeClick={closeAllMenus}
              // onPaneClick={closeAllMenus}
              onNodeClick={handleClickedOutsideOfMenu}
              onPaneClick={handleClickedOutsideOfMenu}
              deleteKeyCode={null} // disable delete using backspace              
              //deleteKeyCode={['Delete']} // re-asign default backspace delete key to Delete key
              nodesDraggable={false}
              // onDrop={onDrop}
              // onDragOver={onDragOver}
              elevateEdgesOnSelect={true}
          >      
              <Controls />
              <MiniMap zoomable pannable/>
              <Background variant="dots" gap={12} size={1} />
              {/* <Panel position="top-right">
                  <div>
                    <div>TODO: Panel</div>
                    <div>
                      <button onClick={addNode}>Add Node 11</button>
                    </div>
                  </div>
              </Panel> */}
              <ControlPanel />
              <NodePanel />
              <div id="edgeTooltip" className='edgeTooltip'></div>
              {/* <div id="nodeReactTooltip" className='nodeTooltip'></div> */}
              <Tooltip id="nodeReactTooltip"/>
          </ReactFlow>
        {/* </ReactFlowProvider> */}
      </div>
    </MenuContext.Provider>
  );
}