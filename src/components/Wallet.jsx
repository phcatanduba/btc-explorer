import React, { useState, useEffect } from 'react';
import './Wallet.css';

function Wallet() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [walletName, setWalletName] = useState('');
    const [walletInfo, setWalletInfo] = useState(null);
    const [wallets, setWallets] = useState([]);
    const [selectedWallet, setSelectedWallet] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [copiedAddress, setCopiedAddress] = useState(false);

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

    // Load wallet list
    const loadWallets = async () => {
        try {
            const result = await makeRpcCall('listwallets');
            setWallets(result);
        } catch (err) {
            setError('Error loading wallets: ' + err.message);
        }
    };

    // Load wallet info
    const loadWalletInfo = async () => {
        if (!selectedWallet) return;
        
        try {
            setLoading(true);
            await makeRpcCall('loadwallet', [selectedWallet]);
            const info = await makeRpcCall('getwalletinfo');
            setWalletInfo(info);
            setError(null);
        } catch (err) {
            setError('Error loading wallet info: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWallets();
    }, []);

    useEffect(() => {
        if (selectedWallet) {
            loadWalletInfo();
        }
    }, [selectedWallet]);

    const handleCreateWallet = async (e) => {
        e.preventDefault();
        if (!walletName.trim()) {
            setError('Please enter a wallet name');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            await makeRpcCall('createwallet', [walletName]);
            setSuccess(`Wallet "${walletName}" created successfully!`);
            setWalletName('');
            loadWallets();
        } catch (err) {
            setError('Error creating wallet: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAddress = async () => {
        if (!selectedWallet) {
            setError('Please select a wallet first');
            return;
        }

        try {
            setLoading(true);
            const address = await makeRpcCall('getnewaddress');
            setNewAddress(address);
            setSuccess('New address generated successfully!');
            loadWalletInfo();
        } catch (err) {
            setError('Error generating address: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendBitcoin = async (e) => {
        e.preventDefault();
        if (!selectedWallet) {
            setError('Please select a wallet first');
            return;
        }

        if (!recipientAddress || !sendAmount) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            await makeRpcCall('sendtoaddress', [recipientAddress, parseFloat(sendAmount)]);
            setSuccess('Transaction sent successfully!');
            setRecipientAddress('');
            setSendAmount('');
            loadWalletInfo();
        } catch (err) {
            setError('Error sending transaction: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAddress = (address) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2000);
    };

    return (
        <div className="wallet-container">
            {/* Create Wallet Section */}
            <div className="wallet-section">
                <h2>Create New Wallet</h2>
                <form onSubmit={handleCreateWallet} className="create-wallet-form">
                    <div className="form-group">
                        <label htmlFor="walletName">Wallet Name</label>
                        <input
                            type="text"
                            id="walletName"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            placeholder="Enter wallet name"
                            disabled={loading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="action-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Wallet'}
                    </button>
                </form>
            </div>

            {/* Wallet Selection */}
            <div className="wallet-section">
                <h2>Select Wallet</h2>
                <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="wallet-select"
                    disabled={loading}
                >
                    <option value="">Select a wallet</option>
                    {wallets.map(wallet => (
                        <option key={wallet} value={wallet}>{wallet}</option>
                    ))}
                </select>
            </div>

            {/* Wallet Info */}
            {selectedWallet && walletInfo && (
                <div className="wallet-section">
                    <h2>Wallet Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Balance</span>
                            <span className="info-value highlight">{walletInfo.balance} BTC</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Unconfirmed</span>
                            <span className="info-value">{walletInfo.unconfirmed_balance} BTC</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Immature</span>
                            <span className="info-value">{walletInfo.immature_balance} BTC</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Transactions</span>
                            <span className="info-value">{walletInfo.txcount}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Address */}
            {selectedWallet && (
                <div className="wallet-section">
                    <h2>Generate New Address</h2>
                    <button 
                        className="action-button"
                        onClick={handleGenerateAddress}
                        disabled={loading}
                    >
                        Generate Address
                    </button>
                    {newAddress && (
                        <div className="address-display">
                            <span className="address-label">New Address:</span>
                            <span className="address-value">{newAddress}</span>
                            <button
                                className={`copy-button ${copiedAddress ? 'copied' : ''}`}
                                onClick={() => handleCopyAddress(newAddress)}
                            >
                                {copiedAddress ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Send Bitcoin */}
            {selectedWallet && (
                <div className="wallet-section">
                    <h2>Send Bitcoin</h2>
                    <form onSubmit={handleSendBitcoin} className="send-form">
                        <div className="form-group">
                            <label htmlFor="recipientAddress">Recipient Address</label>
                            <input
                                type="text"
                                id="recipientAddress"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                placeholder="Enter recipient's address"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="amount">Amount (BTC)</label>
                            <input
                                type="number"
                                id="amount"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                placeholder="0.0"
                                step="0.00000001"
                                min="0"
                                disabled={loading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="action-button"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Bitcoin'}
                        </button>
                    </form>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
        </div>
    );
}

export default Wallet; 