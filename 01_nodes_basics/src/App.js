import React from 'react';

import FlowChart from './FlowChart'

const initialNodes = [
  { id: '1', data: { label: 'Node 1' } },  
  { id: '2', data: { label: 'Node 2' } },  
  { id: '3', data: { label: 'Node 3' } },  
  { id: '4', data: { label: 'Node 4' } },  
  { id: '5', data: { label: 'Node 5' } },  
  { id: '6', data: { label: 'Node 6' } },    
  { id: '7', data: { label: 'Node 7' } },  
  { id: '8', data: { label: 'Node 8' } },  
  { id: '9', data: { label: 'Node 9' } },  
  { id: '10', data: { label: 'Node 10' } },   
];

const initialEdges = [
  { id: '1-2', source: '1', target: '2' },
  { id: '2-3', source: '2', target: '3' },
  { id: '2-4', source: '2', target: '4' },
  { id: '3-5', source: '3', target: '5' },
  { id: '4-5', source: '4', target: '5' },
  { id: '5-6', source: '5', target: '6' },
  { id: '6-7', source: '6', target: '7' },
  { id: '8-9', source: '8', target: '9' },
  { id: '9-10', source: '9', target: '10' },
  { id: '3-9', source: '3', target: '9' },
  { id: '6-4', source: '6', target: '4' },  
];

export default function App() {

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowChart initialNodes={initialNodes} initialEdges={initialEdges}/>
    </div>
  );
}