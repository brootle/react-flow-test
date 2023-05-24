// import React, { useCallback, useEffect } from 'react';
import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  ReactFlowProvider
} from 'reactflow';

import 'reactflow/dist/style.css';

import './index.css';

import FloatingEdge from './FloatingEdge.js';
import FloatingConnectionLine from './FloatingConnectionLine.js';

import DeafaultNode from './DeafaultNode';

import ControlPanel from './ControlPanel';

import dagre from 'dagre';

import { MenuContext } from './MenuContext';

// // see https://reactflow.dev/docs/examples/layout/dagre/
// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

const edgeTypes = {
  floating: FloatingEdge
};

const nodeTypes = {
  defaultNode: DeafaultNode
};

const proOptions = { hideAttribution: true };

export default function App({initialNodes, initialEdges}) {

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

  // const edgesWithType = addTypeToEdges(initialEdges, 'smoothstep');
  const edgesWithType = addTypeToEdges(initialEdges, 'floating');

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

  const [openMenuId, setOpenMenuId] = useState(null);

  const handleClickedOutsideOfMenu = useCallback(() => {
    setOpenMenuId(null)
  }, []);  

  // this can be used when there are changes to nodes or edges
  function logChange({ type, ...rest }) {
    //console.log(`CHANGE: ${type}`, rest);
    if(type === 'remove'){

      const {id} = rest

      // Remove node with specified id
      const updatedNodes = nodes.filter((node) => node.id !== id);

      // Remove all edges associated with specified node
      const updatedEdges = edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );
      
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
  }

  return (
    <MenuContext.Provider value={{openMenuId, setOpenMenuId }}>
      <div className="floatingedges">
        <ReactFlowProvider>
          <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              // onNodesChange={(changes) => {
              //   onNodesChange(changes);
              //   changes.forEach(logChange);
              // }}
              onEdgesChange={onEdgesChange}
              // onEdgesChange={(changes) => {
              //   onEdgesChange(changes);
              //   changes.forEach(logChange);
              //   // console.log("changes: ", changes)
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
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </MenuContext.Provider>
  );
}