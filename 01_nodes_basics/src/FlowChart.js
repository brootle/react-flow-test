import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType
} from 'reactflow';

import 'reactflow/dist/style.css';

import './index.css';

import FloatingEdge from './FloatingEdge.js';
import FloatingConnectionLine from './FloatingConnectionLine.js';

import DeafaultNode from './DeafaultNode';

import dagre from 'dagre';

// see https://reactflow.dev/docs/examples/layout/dagre/
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const edgeTypes = {
  floating: FloatingEdge
};

const nodeTypes = {
  defaultNode: DeafaultNode
};

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

  // using dagre
  const getLayoutedElements = (nodes, edges, direction = 'TB') => {
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

  console.log("edgesWithMarker: ", edgesWithMarker)

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

  return (
    <div className="floatingedges">
      <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          connectionLineComponent={FloatingConnectionLine}
      >
          <Controls />
          <MiniMap zoomable pannable/>
          <Background variant="dots" gap={12} size={1} />
          <Panel position="top-right">
              <div>TODO: Panel</div>
          </Panel>
      </ReactFlow>
    </div>
  );
}