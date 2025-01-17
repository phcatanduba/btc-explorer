import React, { useState, useEffect } from 'react';
import './Mining.css';

function Mining() {
    const [numBlocks, setNumBlocks] = useState(1);
    const [miningStatus, setMiningStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [miningAddress, setMiningAddress] = useState('');
    const [addresses, setAddresses] = useState([]);

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
            console.error('Error:', error);
            throw error;
        }
    };

    const getAddresses = async () => {
        try {
            const result = await makeRpcCall('getaddressesbylabel', ['']);
            const addressList = Object.keys(result);
            setAddresses(addressList);
            if (addressList.length > 0) {
                setMiningAddress(addressList[0]);
            }
        } catch (error) {
            setMiningStatus('Error loading addresses: ' + error.message);
        }
    };

    useEffect(() => {
        getAddresses();
    }, []);

    const handleInputChange = (e) => {
        const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
        setNumBlocks(value);
    };

    const mineBlocks = async () => {
        if (!miningAddress) {
            setMiningStatus('Please select a mining address first');
            return;
        }

        setIsLoading(true);
        setMiningStatus('Mining blocks...');
        
        try {
            const result = await makeRpcCall('generatetoaddress', [parseInt(numBlocks), miningAddress]);
            const blockCount = result.length;
            setMiningStatus(`${blockCount} ${blockCount === 1 ? 'block' : 'blocks'} successfully mined to ${miningAddress}!`);
        } catch (error) {
            setMiningStatus(`Error mining blocks: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mining-container">
            <h2>Block Mining</h2>
            <p className="mining-description">
                Specify how many blocks you want to mine (1-100) and select a destination address
            </p>
            <div className="mining-controls">
                <div className="mining-input-group">
                    <label htmlFor="blockCount">Number of Blocks</label>
                    <input
                        id="blockCount"
                        type="number"
                        min="1"
                        max="100"
                        value={numBlocks}
                        onChange={handleInputChange}
                        className="block-input"
                        disabled={isLoading}
                    />
                </div>
                <div className="mining-input-group">
                    <label htmlFor="miningAddress">Mining Address</label>
                    <select
                        id="miningAddress"
                        value={miningAddress}
                        onChange={(e) => setMiningAddress(e.target.value)}
                        className="address-select"
                        disabled={isLoading}
                    >
                        <option value="">Select an address</option>
                        {addresses.map(address => (
                            <option key={address} value={address}>
                                {address}
                            </option>
                        ))}
                    </select>
                </div>
                <button 
                    onClick={mineBlocks} 
                    className={`mine-button ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading || !miningAddress}
                >
                    {isLoading ? 'Mining...' : 'Mine Blocks'}
                </button>
            </div>
            {miningStatus && (
                <div className={`mining-status ${isLoading ? 'loading' : ''}`}>
                    {miningStatus}
                </div>
            )}
        </div>
    );
}

export default Mining; 