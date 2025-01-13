import React from 'react';
import BlockCard from './Block';

function ResultDisplay({ data, type }) {
  console.log(data)
  switch (type) {
    case 'address':
      return (
        <>
          <div>Endereço: {data.data.input}</div>
          <div>Balance: {data.data.response.result} BTC </div>
        </>
      );
    case 'tx':
      return (
        <>
          <div>Hash: {data.data.input}</div>
          <div>Block: {data.data.response.result.blockhash}</div>
          <div>Confirmations: {data.data.response.result.confirmations}</div>
          <div>Time: {new Date(data.data.response.result.time * 1000).toUTCString()}</div>
          <div>Inputs: {data.data.response.result.vin.length}</div>
          <div>Outputs: {data.data.response.result.vout.length}</div>
          <div>Recipient: {data.data.response.result.vout[0].scriptPubKey.address}</div>
          <div>Amount Transferred: {data.data.response.result.vout[0].value} BTC</div>
        </>
      );
    case 'block':
      return <BlockCard number={data.data.input} hash={data.data.response.result}/>;
    case 'unknown':
      return <div className="valid-query-message">Por favor, insira uma consulta válida.</div>;
    default:
      return <></>;
  }
}

export default ResultDisplay;
