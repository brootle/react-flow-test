import { useCallback } from 'react';
import { useStore, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

import { getEdgeParams } from './utils.js';

function FloatingEdge({ id, source, target, markerEnd, style, data }) {
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

  return (
    <g className='floatingEdge' onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onMouseMove={showTooltipOnMove}> 
        <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            style={style}
        />
        <path
            id={id + "_transparent"}
            className="react-flow__edge-path--transparent"
            d={edgePath}
        />        
        {
            data?.text && 
            <>

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