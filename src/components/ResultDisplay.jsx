import React, { useState } from 'react';
import './ResultDisplay.css';

function ResultDisplay({ data, type }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!data || !data.data) return null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const ResultItem = ({ label, value, highlight, copyable }) => (
    <div className="result-item">
      <div className="result-label">{label}</div>
      <div className={`result-value ${highlight ? 'highlight' : ''}`}>
        {value}
        {copyable && (
          <button
            className={`copy-button ${copiedField === label ? 'copied' : ''}`}
            onClick={() => copyToClipboard(value, label)}
          >
            {copiedField === label ? '✓' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'address':
        return (
          <div className="result-grid">
            <ResultItem
              label="Address"
              value={data.data.input}
              copyable
            />
            <ResultItem
              label="Balance"
              value={`${data.data.response.result} BTC`}
              highlight
            />
          </div>
        );
      case 'tx':
        return (
          <div className="result-grid">
            <ResultItem
              label="Transaction Hash"
              value={data.data.input}
              copyable
            />
            <ResultItem
              label="Block Hash"
              value={data.data.response.result.blockhash}
              copyable
            />
            <ResultItem
              label="Confirmations"
              value={data.data.response.result.confirmations}
              highlight
            />
            <ResultItem
              label="Time"
              value={new Date(data.data.response.result.time * 1000).toUTCString()}
            />
            <ResultItem
              label="Inputs"
              value={data.data.response.result.vin.length}
            />
            <ResultItem
              label="Outputs"
              value={data.data.response.result.vout.length}
            />
            <ResultItem
              label="Recipient"
              value={data.data.response.result.vout[0].scriptPubKey.address}
              copyable
            />
            <ResultItem
              label="Amount"
              value={`${data.data.response.result.vout[0].value} BTC`}
              highlight
            />
          </div>
        );
      case 'block':
        return (
          <div className="result-grid">
            <ResultItem
              label="Block Number"
              value={data.data.input}
              highlight
            />
            <ResultItem
              label="Block Hash"
              value={data.data.response.result}
              copyable
            />
          </div>
        );
      case 'unknown':
        return <div className="error-message">Invalid input</div>;
      default:
        return null;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'address':
        return 'Wallet Address';
      case 'tx':
        return 'Transaction';
      case 'block':
        return 'Block';
      default:
        return 'Result';
    }
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-type-badge">{getTypeLabel()}</div>
      </div>
      {renderContent()}
    </div>
  );
}

export default ResultDisplay;
