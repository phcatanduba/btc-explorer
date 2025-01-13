import React from 'react';

function BlockCard({ number, hash }) {
  return (
    <div className="block-card">
        <h2>Block Number: {number} </h2>
        <h2>Block Hash: {hash} </h2>
    </div>
  );
}

export default BlockCard; 