import React, { useState, useEffect } from 'react';
import './LatestTransactions.css';

function LatestTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedTx, setCopiedTx] = useState(null);

    const rpcUser = process.env.REACT_APP_RPC_USER;
    const rpcPassword = process.env.REACT_APP_RPC_PASSWORD;
    const rpcUrl = process.env.REACT_APP_RPC_URL;

    const makeRpcCall = async (method, params = []) => {
        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${rpcUser}:${rpcPassword}`)
                },
                body: JSON.stringify({
                    jsonrpc: '1.0',
                    id: 'curltest',
                    method,
                    params
                })
            });

            if (!response.ok) {
                throw new Error('Network response error');
            }

            const result = await response.json();
            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.result;
        } catch (error) {
            throw error;
        }
    };

    const getLatestTransactions = async () => {
        try {
            setLoading(true);
            // Get the latest block count
            const blockCount = await makeRpcCall('getblockcount');
            // Get the latest block hash
            const blockHash = await makeRpcCall('getblockhash', [blockCount]);
            // Get block details
            const block = await makeRpcCall('getblock', [blockHash, 2]);
            
            // Get the last 5 transactions from the block
            const latestTxs = block.tx.slice(0, 5).map(tx => ({
                txid: tx.txid,
                time: block.time,
                amount: tx.vout.reduce((sum, output) => sum + (output.value || 0), 0),
                inputs: tx.vin.length,
                outputs: tx.vout.length
            }));

            setTransactions(latestTxs);
            setError(null);
        } catch (err) {
            setError('Error loading transactions: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLatestTransactions();
        // Refresh every 30 seconds
        const interval = setInterval(getLatestTransactions, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    const handleCopy = (txid) => {
        navigator.clipboard.writeText(txid);
        setCopiedTx(txid);
        setTimeout(() => setCopiedTx(null), 2000);
    };

    if (loading && transactions.length === 0) {
        return (
            <div className="latest-tx-container">
                <h2>Latest Transactions</h2>
                <div className="loading-message">Loading transactions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="latest-tx-container">
                <h2>Latest Transactions</h2>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="latest-tx-container">
            <div className="latest-tx-header">
                <h2>Latest Transactions</h2>
                <button 
                    className="refresh-button"
                    onClick={getLatestTransactions}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>
            <div className="transactions-list">
                {transactions.map((tx) => (
                    <div key={tx.txid} className="transaction-item">
                        <div className="tx-main-info">
                            <div className="tx-id">
                                <span className="tx-label">TX:</span>
                                <span className="tx-value">
                                    {tx.txid}
                                </span>
                                <button
                                    className={`copy-button ${copiedTx === tx.txid ? 'copied' : ''}`}
                                    onClick={() => handleCopy(tx.txid)}
                                >
                                    {copiedTx === tx.txid ? '✓' : 'Copy'}
                                </button>
                            </div>
                            <div className="tx-amount">
                                <span className="tx-label">Amount:</span>
                                <span className="tx-value highlight">
                                    {tx.amount.toFixed(8)} BTC
                                </span>
                            </div>
                        </div>
                        <div className="tx-details">
                            <div className="tx-detail">
                                <span className="tx-label">Time:</span>
                                <span className="tx-value">{formatTime(tx.time)}</span>
                            </div>
                            <div className="tx-detail">
                                <span className="tx-label">Inputs:</span>
                                <span className="tx-value">{tx.inputs}</span>
                            </div>
                            <div className="tx-detail">
                                <span className="tx-label">Outputs:</span>
                                <span className="tx-value">{tx.outputs}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LatestTransactions; 