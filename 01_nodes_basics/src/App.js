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

// const initialFlow = {
//     "Flow": {
//         "Name": "Demo.Flow",
//         "Comment": "Change variables in {var: ...} and run ./make-graph",
//         "var": {
//             "source_url": ""
//         },
//         "global_error_handler": 10,
//         "entry_points": {
//             "Start": 11,
//             "MyEvent": 100
//         },
//         "nodes": [
//             {
//                 "id": 11,
//                 "type": "DownloadVideo",
//                 "output": "DownloadedVideo_1"
//             },
//             {
//                 "id": 2,
//                 "name": "ExtractAudio_1",
//                 "type": "ExtractAudio",
//                 "input": "DownloadedVideo_1",
//                 "output": "ExtractedAudio_1",
//                 "on_error": 10
//             },
//             {
//                 "id": 3,
//                 "name": "TranscribeAudio_1",
//                 "type": "TranscribeAudio",
//                 "input": "ExtractedAudio_1",
//                 "output": "TranscribedAudio_1"
//             },
//             {
//                 "id": 4,
//                 "name": "ConvertVideo_1",
//                 "type": "ConvertVideo",
//                 "input": "DownloadedVideo_1",
//                 "output": "ConvertedVideo_1"
//             },
//             {
//                 "id": 5,
//                 "name": "JoinVideo_1",
//                 "type": "JoinVideo",
//                 "input": [
//                     "ConvertedVideo_1",
//                     "TranscribedAudio_1"
//                 ],
//                 "output": "JoinedVideo_1"
//             },
//             {
//                 "id": 10,
//                 "name": "SendNotification_1",
//                 "type": "SendNotification",
//             }
//         ],
//         "links": [
//             {"type": "dataflow", "from": "1", "to": "2"},
//             {"type": "dataflow", "from": "1", "to": "4"},
//             {"type": "dataflow", "from": "2", "to": "3"},
//             {"type": "dataflow", "from": "4", "to": "5"},
//             {"type": "dataflow", "from": "3", "to": "5"},
//             {"type": "controlflow", "label": "true", "from": "...", "to": "..."},
//             {"type": "controlflow", "label": "false", "from": "...", "to": "..."}
//         ]
//     }
// }

export default function App() {

  // need to test this more
  // const nodes = initialFlow.Flow.nodes

  // const findNodeIdByOutput = (outputName) => {
  //   const node = nodes.find((node) => node.output === outputName);
  //   return node ? node.id : null;
  // };

  // const createLinks = (nodes) => {
  //   const links = [];

  //   nodes.forEach((node) => {
  //     if (node.input) {
  //       const inputs = Array.isArray(node.input) ? node.input : [node.input];
  //       inputs.forEach((input) => {
  //         const sourceNodeId = findNodeIdByOutput(input);
  //         if (sourceNodeId) {
  //           links.push({
  //             id: `${sourceNodeId}-${node.id}`,
  //             source: sourceNodeId,
  //             target: node.id,
  //             type: "floating",
  //             markerEnd: { type: "arrowclosed" },
  //           });
  //         }
  //       });
  //     }

  //     if (node.on_error) {
  //       const onErrorNodeId = node.on_error;
  //       links.push({
  //         id: `${node.id}-${onErrorNodeId}`,
  //         source: node.id,
  //         target: onErrorNodeId,
  //         type: "floating",
  //         markerEnd: { type: "arrowclosed" },
  //       });
  //     }
  //   });

  //   return links;
  // };

  // const links = createLinks(nodes);
  // console.log("Links array:", links);


  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FlowChart initialNodes={initialNodes} initialEdges={initialEdges}/>
    </div>
  );
}