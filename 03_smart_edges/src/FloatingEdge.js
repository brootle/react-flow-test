import { useCallback } from 'react';
import { useStore, getSmoothStepPath, EdgeLabelRenderer, useStoreApi, BezierEdge  } from 'reactflow';

import { getEdgeParams } from './utils.js';

import { getSmartEdge, svgDrawSmoothLinePath, svgDrawStraightLinePath } from '@tisoap/react-flow-smart-edge'

function FloatingEdge({ id, source, target, markerEnd, style, data, selected }) {

  // getting nodes
  // const store = useStoreApi();
  // const { nodeInternals } = store.getState();
  // const nodes = Array.from(nodeInternals).map(([, node]) => node);

  const nodes = useStore(useCallback((store) => Array.from(store.nodeInternals).map(([, node]) => node)));

  const sourceNode = useStore(useCallback((store) => store.nodeInternals.get(source), [source]));
  const targetNode = useStore(useCallback((store) => store.nodeInternals.get(target), [target]));

  if (!sourceNode || !targetNode) {
    return null;
  }


  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
    borderRadius: 5,
  });

  const myOptions = {
    // your configuration goes here
    // nodePadding: 10,
    // gridRatio: 15,
    // drawEdge: svgDrawSmoothLinePath
  }

  const getSmartEdgeResponse = getSmartEdge({
		sourcePosition: sourcePos,
		targetPosition: targetPos,
		sourceX: sx,
		sourceY: sy,
		targetX: tx,
		targetY: ty,
		nodes,
    options: myOptions
	})

  const { edgeCenterX, edgeCenterY, svgPathString } = getSmartEdgeResponse

  //console.log("svgPathString: ", svgPathString)

  //console.log("getSmartEdgeResponse: ", getSmartEdgeResponse)
 
//   const showTooltip = (event) => {
//     const tooltipElement = document.getElementById("edgeTooltip");
//     if (tooltipElement) {
//       tooltipElement.style.left = `${event.pageX + 10}px`;
//       tooltipElement.style.top = `${event.pageY + 15}px`;
//       tooltipElement.style.display = 'block';
//       tooltipElement.innerHTML = `Link ${id}`; // Assuming you want to show the edge's text in the tooltip
//     }
//   };

  const showTooltipOnMove = (event) => {
    const tooltipElement = document.getElementById("edgeTooltip");
    if (tooltipElement) {
      tooltipElement.style.left = `${event.pageX + 10}px`;
      tooltipElement.style.top = `${event.pageY + 15}px`;
    }
  };  

//   const hideTooltip = () => {
//     const tooltipElement = document.getElementById("edgeTooltip");
//     if (tooltipElement) {
//       tooltipElement.style.display = 'none';
//     }
//   };

  const showTooltip = (event) => {
    const tooltipElement = document.getElementById("edgeTooltip");
    if (tooltipElement) {
      tooltipElement.style.left = `${event.pageX + 10}px`;
      tooltipElement.style.top = `${event.pageY + 15}px`;
      tooltipElement.classList.add('visible');
      tooltipElement.innerHTML = `Link ${id}`; // Assuming you want to show the edge's text in the tooltip
    }
  };
  
  const hideTooltip = () => {
    const tooltipElement = document.getElementById("edgeTooltip");
    if (tooltipElement) {
      tooltipElement.classList.remove('visible');
    }
  };  

  // Check the current zIndex of the edge inside the custom edge and apply it to the edgeLabelRenderer

  //console.log("selected: ", selected)

  return (
    <g className='floatingEdge' onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onMouseMove={showTooltipOnMove}> 
        <path
            id={id}
            className="react-flow__edge-path"
            //d={edgePath}
            d={svgPathString}
            markerEnd={markerEnd}
            style={style}
        />
        <path
            id={id + "_transparent"}
            className="react-flow__edge-path--transparent"
            //d={edgePath}
            d={svgPathString}
        />        
        {
            data?.text && 
            <>

                <EdgeLabelRenderer>
                    <div                        
                        style={{
                            // transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            transform: `translate(-50%, -50%) translate(${edgeCenterX}px,${edgeCenterY}px)`,
                            zIndex: selected ? 1000 : 'auto',
                        }}
                        className={data?.condition ? 'nodrag nopan react-flow__edge-condition react-flow__edge-condition--true' : 'nodrag nopan react-flow__edge-condition react-flow__edge-condition--false'}
                    >
                        {data.text}
                    </div>
                </EdgeLabelRenderer>                  

                {/* {
                    sourcePos === 'bottom' &&  
                    <EdgeLabelRenderer>
                        <div                        
                            style={{
                                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            }}
                            className={data?.condition ? 'nodrag nopan react-flow__edge-condition react-flow__edge-condition--true' : 'nodrag nopan react-flow__edge-condition react-flow__edge-condition--false'}
                        >
                            {data.text}
                        </div>
                    </EdgeLabelRenderer>                    
                }

                {
                    sourcePos === 'left' &&
                    <text x={sx-20} y={sy}  style={{ fontSize: 12, textAnchor: 'middle', dominantBaseline: 'middle' }}>
                        {data.text}
                    </text>    
                }    

                {
                    sourcePos === 'top' &&
                    <text x={sx} y={sy-20}  style={{ fontSize: 12, textAnchor: 'middle', dominantBaseline: 'middle' }}>
                        {data.text}
                    </text>    
                }    

                {
                    sourcePos === 'right' &&
                    <text x={sx+20} y={sy}  style={{ fontSize: 12, textAnchor: 'middle', dominantBaseline: 'middle' }}>
                        {data.text}
                    </text>    
                }                                                 */}
            </>    
                        
        }             
    </g>
  );
}

export default FloatingEdge;