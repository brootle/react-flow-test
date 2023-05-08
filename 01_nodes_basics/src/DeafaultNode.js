import React, { memo } from 'react';

import { Handle } from 'reactflow';

export default memo(({ data }) => {
  return (
    <>
      <Handle 
        type="target"
      />
      <div className='defaultNode'>
        <strong>{data.label}</strong>
      </div>
      <Handle 
        type="source"
      />
    </>
  );
});