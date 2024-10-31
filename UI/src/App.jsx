import { NearContext } from './context';

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar"
import { Wallet } from "./services/near-wallet";
import { EthereumView } from "./components/Ethereum/Ethereum";
import { BitcoinView } from "./components/Bitcoin";

// CONSTANTS
const MPC_CONTRACT = 'v1.signer-prod.testnet';

// NEAR WALLET
const wallet = new Wallet({ network: 'testnet' });

// parse transactionHashes from URL
const txHash = new URLSearchParams(window.location.search).get('transactionHashes');
const transactions = txHash ? txHash.split(',') : [];

function App() {
  const [signedAccountId, setSignedAccountId] = useState('');
  const [status, setStatus] = useState("Please login to request a signature");
  const [chain, setChain] = useState('eth');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Navbar />
      <div className="container">
      <h4> 🔗 Chain Abstracted Ethereum (caETH) </h4>
        <p className="small text-center">
        caETH is a non-custodial representation of Ethereum on the NEAR Protocol, designed to facilitate interoperability between the two networks. Each caETH is paired 1:1 with ETH, ensuring that users have direct access to their assets without custody risks.
        </p>

        {signedAccountId &&
          <div style={{ width: '50%', minWidth: '400px' }}>

            <div className="input-group input-group-sm my-2 mb-4">
              <span className="text-primary input-group-text" id="chain">Chain</span>
              <select className="form-select" aria-describedby="chain" value={chain} onChange={e => setChain(e.target.value)} >
                <option value="eth"> Ξ Ethereum </option>
              </select>
            </div>

            {chain === 'eth' && <EthereumView props={{ setStatus, MPC_CONTRACT, transactions }} />}
            {chain === 'btc' && <BitcoinView props={{ setStatus, MPC_CONTRACT, transactions }} />}
          </div>
        }

        <div className="mt-3 small text-center">
          {status}
        </div>

        <div style={{ 
            padding: '10px', 
            margin: '10px', 
            backgroundColor: '#FFC10780', 
            borderRadius: '5px', 
            fontSize: '15px',
          }}>
        ⚠️ Warning: Minimum deposit is used. MPC congestion may cause transaction failure. See documentation for details.
         </div>

      </div>
    </NearContext.Provider>
  )
}

export default App
