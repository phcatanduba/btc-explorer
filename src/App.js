import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultDisplay from './components/ResultDisplay';
import Mining from './components/Mining';
import Wallet from './components/Wallet';
import Footer from './components/Footer';
import LatestTransactions from './components/LatestTransactions';
import LatestBlocks from './components/LatestBlocks';
import './App.css';
import Logo from "./Bitcoin.svg"

function App() {
  const [input, setInput] = useState('');
  const [data, setData] = useState({ data: null, type: null });
  const [activeTab, setActiveTab] = useState('explorer');
  let searchType = "";

  const rpcUser = process.env.REACT_APP_RPC_USER;
  const rpcPassword = process.env.REACT_APP_RPC_PASSWORD;
  const rpcUrl = process.env.REACT_APP_RPC_URL;

  const getBlockByNumber = async(number) => {
    searchType = "block";
    const method = 'getblockhash';
    const params = [parseInt(number)];
    getBlockchainInfo(method, params);
  };

  const getTransactionByHash = async(hash) => {
    searchType = "tx";
    const method = 'getrawtransaction';
    const params = [hash, 1];
    getBlockchainInfo(method, params);
  };

  const getBalanceByAddress = async(address) => {
    searchType = "address";
    const method = 'getreceivedbyaddress';
    const params = [address, 0];
    const selectedWallet = localStorage.getItem('selectedWallet');
    if (!selectedWallet) {
      setData({ 
        data: null, 
        type: 'unknown', 
        error: 'Please select a wallet first in the Wallet tab' 
      });
      return;
    }
    getBlockchainInfo(method, params, selectedWallet);
  };

  const getBlockchainInfo = async (method, params, wallet = null) => {
    const data = {
        jsonrpc: '1.0',
        id: 'curltest',
        method: method,
        params: params
    };

    try {
        let url = rpcUrl;
        if (wallet) {
            url = `${rpcUrl}wallet/${wallet}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${rpcUser}:${rpcPassword}`)
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Network response error');
        }

        const jsonResponse = await response.json();
        console.log(jsonResponse);
        setData({ data: {input: input, response: jsonResponse}, type: searchType })
    } catch (error) {
        console.error('Error making RPC call:', error);
        setData({ 
          data: null, 
          type: 'unknown', 
          error: error.message 
        });
    }
  };

  const handleSearch = () => {
    if (input.startsWith('bcrt')) {
      if (input.length === 44) {
        getBalanceByAddress(input);
      }
    } else if (!isNaN(input) && input.trim() !== '') {
      getBlockByNumber(input);
    } else if (input.length === 64) {
      getTransactionByHash(input);
    } else {
      console.error('Unknown input type');
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'explorer':
        return (
          <>
            <SearchBar input={input} setInput={setInput} handleSearch={handleSearch} />
            <ResultDisplay data={data} type={data.type} />
            <div className="explorer-grid">
              <LatestTransactions />
              <LatestBlocks />
            </div>
          </>
        );
      case 'mining':
        return <Mining />;
      case 'wallet':
        return <Wallet />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="logo-container">
          <img src={Logo} alt="Logo" className="logo" />
        </div>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            Explorer
          </button>
          <button 
            className={`tab ${activeTab === 'mining' ? 'active' : ''}`}
            onClick={() => setActiveTab('mining')}
          >
            Mining
          </button>
          <button 
            className={`tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            Wallet
          </button>
        </div>
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}

export default App;
