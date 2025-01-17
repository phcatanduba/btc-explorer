import React, { useState, useEffect } from 'react';
import './LatestBlocks.css';

function LatestBlocks() {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedHash, setCopiedHash] = useState(null);

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

    const getLatestBlocks = async () => {
        try {
            setLoading(true);
            // Get the latest block count
            const blockCount = await makeRpcCall('getblockcount');
            
            // Get the last 5 blocks
            const latestBlocks = [];
            for (let i = 0; i < 5; i++) {
                const blockHash = await makeRpcCall('getblockhash', [blockCount - i]);
                const block = await makeRpcCall('getblock', [blockHash]);
                latestBlocks.push({
                    height: block.height,
                    hash: block.hash,
                    time: block.time,
                    txCount: block.tx.length,
                    size: block.size
                });
            }

            setBlocks(latestBlocks);
            setError(null);
        } catch (err) {
            setError('Error loading blocks: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getLatestBlocks();
        // Refresh every 30 seconds
        const interval = setInterval(getLatestBlocks, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    const handleCopy = (hash) => {
        navigator.clipboard.writeText(hash);
        setCopiedHash(hash);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    if (loading && blocks.length === 0) {
        return (
            <div className="latest-blocks-container">
                <h2>Latest Blocks</h2>
                <div className="loading-message">Loading blocks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="latest-blocks-container">
                <h2>Latest Blocks</h2>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="latest-blocks-container">
            <div className="latest-blocks-header">
                <h2>Latest Blocks</h2>
                <button 
                    className="refresh-button"
                    onClick={getLatestBlocks}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>
            <div className="blocks-list">
                {blocks.map((block) => (
                    <div key={block.hash} className="block-item">
                        <div className="block-main-info">
                            <div className="block-height">
                                <span className="block-label">Height:</span>
                                <span className="block-value highlight">
                                    {block.height}
                                </span>
                            </div>
                            <div className="block-hash">
                                <span className="block-label">Hash:</span>
                                <span className="block-value">
                                    {block.hash}
                                </span>
                                <button
                                    className={`copy-button ${copiedHash === block.hash ? 'copied' : ''}`}
                                    onClick={() => handleCopy(block.hash)}
                                >
                                    {copiedHash === block.hash ? '✓' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="block-details">
                            <div className="block-detail">
                                <span className="block-label">Time:</span>
                                <span className="block-value">{formatTime(block.time)}</span>
                            </div>
                            <div className="block-detail">
                                <span className="block-label">Transactions:</span>
                                <span className="block-value">{block.txCount}</span>
                            </div>
                            <div className="block-detail">
                                <span className="block-label">Size:</span>
                                <span className="block-value">{block.size} bytes</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LatestBlocks; 