import React from 'react';

import FlowChart from './FlowChart'

const initialNodes = [
  { id: '1', data: { label: 'Node 1' }, type: 'defaultNode' },  
  { id: '2', data: { label: 'Node 2' }, type: 'defaultNode' },  
  { id: '3', data: { label: 'Node 3' }, type: 'defaultNode' },  
  { id: '4', data: { label: 'Node 4' }, type: 'defaultNode' },  
  { id: '5', data: { label: 'Node 5' }, type: 'defaultNode' },  
  { id: '6', data: { label: 'Node 6' }, type: 'defaultNode' },    
  { id: '7', data: { label: 'Node 7' }, type: 'defaultNode' },  
  { id: '8', data: { label: 'Node 8' }, type: 'defaultNode' },  
  { id: '9', data: { label: 'Node 9' }, type: 'defaultNode' },  
  { id: '10', data: { label: 'Node 10' }, type: 'defaultNode' },   
];

const initialEdges = [
  { id: '1-2', source: '1', target: '2' },
  { id: '2-3', source: '2', target: '3', 
    //animated: true,
    style: { strokeDasharray: '4' },
    data: { text: 'TRUE', condition: true },
  },
  { id: '2-4', source: '2', target: '4', 
    style: { strokeDasharray: '4' },
    data: { text: 'FALSE', condition: false },
  },
  { id: '3-5', source: '3', target: '5' },
  { id: '4-5', source: '4', target: '5', },
  { id: '5-6', source: '5', target: '6' },
  { id: '6-7', source: '6', target: '7' },
  { id: '8-9', source: '8', target: '9' },
  { id: '9-10', source: '9', target: '10' },
  { id: '3-9', source: '3', target: '9' },
  { id: '6-4', source: '6', target: '4' },  
  // { id: '1-3', source: '1', target: '3' },  
];

export default function App() {

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowChart initialNodes={initialNodes} initialEdges={initialEdges}/>
    </div>
  );
}