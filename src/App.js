import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultDisplay from './components/ResultDisplay';
import './App.css';
import Logo from "./Bitcoin.svg"

function App() {
  const [input, setInput] = useState('');
  const [data, setData] = useState({ data: null, type: null });
  let searchType = "";

  const rpcUser = 'user';
  const rpcPassword = 'pass';
  const rpcUrl = `http://localhost:3000/wallet/wallet1`;

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
    getBlockchainInfo(method, params);
  };

  const getBlockchainInfo = async (method, params) => {
    const data = {
        jsonrpc: '1.0',
        id: 'curltest',
        method: method,
        params: params
    };

    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${rpcUser}:${rpcPassword}`)
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const jsonResponse = await response.json();
        console.log(jsonResponse);
        setData({ data: {input: input, response: jsonResponse}, type: searchType })
    } catch (error) {
        console.error('Erro ao fazer a chamada RPC:', error);
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
      console.error('Tipo de entrada desconhecido');
    }
  }

  return (
    <div className="app-container">
      <div className="logo-container">
        <img src={Logo} alt="Logotipo" className="logo" />
      </div>
      <SearchBar input={input} setInput={setInput} handleSearch={handleSearch} />
      <ResultDisplay
        data={data}
        type={data.type}
      />
    </div>
  );
}

export default App;
