import React, { memo, useState, useEffect, useRef } from 'react';

import { Handle } from 'reactflow';

import Menu from './Menu';

export default memo(({id, data }) => {

  return (
    <>
      <Handle 
        type="target"
      />
      <div className='defaultNode'>
        <strong>{data.label}</strong>
        <Menu nodeId={id}/>
      </div>
      <Handle 
        type="source"
      />
    </>
  );
});