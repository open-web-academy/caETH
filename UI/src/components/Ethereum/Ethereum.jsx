import { useState, useEffect, useContext } from "react";
import { utils } from "web3"
import { NearContext } from "../../context";

import { Ethereum } from "../../services/ethereum";
import { useDebounce } from "../../hooks/debounce";
import PropTypes from 'prop-types';
import { useRef } from "react";
import { TransferForm } from "./Transfer";
import { FunctionCallForm } from "./FunctionCall";
import { LockEthForm } from "./LockEth";
import { UnlockEthForm } from "./UnlockEth";
import { WithdrawForm } from "./Withdraw";

const Sepolia = 11155111;
const Eth = new Ethereum('https://rpc2.sepolia.org', Sepolia);
const caETHabi= [
  {
      anonymous: false,
      inputs: [
          {
              indexed: true,
              internalType: "address",
              name: "ETHaddress",
              type: "address"
          },
          {
              indexed: false,
              internalType: "string",
              name: "nearAccountId",
              type: "string"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "newDeposit",
              type: "uint256"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "totalBalance",
              type: "uint256"
          }
      ],
      name: "AccountDeposit",
      type: "event"
  },
  {
      anonymous: false,
      inputs: [
          {
              indexed: true,
              internalType: "address",
              name: "fromETH",
              type: "address"
          },
          {
              indexed: true,
              internalType: "address",
              name: "toETH",
              type: "address"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "amountTransferred",
              type: "uint256"
          }
      ],
      name: "LockedTokensTransferred",
      type: "event"
  },
  {
      anonymous: false,
      inputs: [
          {
              indexed: true,
              internalType: "address",
              name: "ETHaddress",
              type: "address"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "amountLocked",
              type: "uint256"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "globalLocked",
              type: "uint256"
          }
      ],
      name: "TokensLocked",
      type: "event"
  },
  {
      anonymous: false,
      inputs: [
          {
              indexed: true,
              internalType: "address",
              name: "ETHaddress",
              type: "address"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "amountUnlocked",
              type: "uint256"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "totalLocked",
              type: "uint256"
          },
          {
              indexed: false,
              internalType: "uint256",
              name: "totalBalance",
              type: "uint256"
          }
      ],
      name: "TokensUnlocked",
      type: "event"
  },
  {
      inputs: [
          {
              internalType: "address",
              name: "",
              type: "address"
          }
      ],
      name: "accounts",
      outputs: [
          {
              internalType: "address",
              name: "ETHaddress",
              type: "address"
          },
          {
              internalType: "string",
              name: "nearAccountId",
              type: "string"
          },
          {
              internalType: "uint256",
              name: "tokenAmount",
              type: "uint256"
          },
          {
              internalType: "uint256",
              name: "lockedTokens",
              type: "uint256"
          }
      ],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "string",
              name: "nearAccountId",
              type: "string"
          }
      ],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "address",
              name: "ethAddress",
              type: "address"
          }
      ],
      name: "getAccountData",
      outputs: [
          {
              components: [
                  {
                      internalType: "address",
                      name: "ETHaddress",
                      type: "address"
                  },
                  {
                      internalType: "string",
                      name: "nearAccountId",
                      type: "string"
                  },
                  {
                      internalType: "uint256",
                      name: "tokenAmount",
                      type: "uint256"
                  },
                  {
                      internalType: "uint256",
                      name: "lockedTokens",
                      type: "uint256"
                  }
              ],
              internalType: "struct caETH.AccountData",
              name: "",
              type: "tuple"
          }
      ],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [],
      name: "getTotalLockedTokens",
      outputs: [
          {
              internalType: "uint256",
              name: "",
              type: "uint256"
          }
      ],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
          }
      ],
      name: "lockTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
  },
  {
      inputs: [],
      name: "totalLockedTokens",
      outputs: [
          {
              internalType: "uint256",
              name: "",
              type: "uint256"
          }
      ],
      stateMutability: "view",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "address",
              name: "to",
              type: "address"
          },
          {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
          },
          {
              internalType: "string",
              name: "nearAccountId",
              type: "string"
          }
      ],
      name: "transferLockedTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
          }
      ],
      name: "unlockTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
  },
  {
      inputs: [
          {
              internalType: "uint256",
              name: "amount",
              type: "uint256"
          }
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
  }
]

const caETHContract= '0x2690a8ECE5a570eeBAE7a7378F03cbDaF0f3dD96'

export function EthereumView({ props: { setStatus, MPC_CONTRACT, transactions } }) {
  const { wallet, signedAccountId } = useContext(NearContext);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(transactions ? 'relay' : "request");
  const [signedTransaction, setSignedTransaction] = useState(null);

  const [senderLabel, setSenderLabel] = useState("")
  const [senderAddress, setSenderAddress] = useState("")
  const [action, setAction] = useState("function-call")
  const [balance, setBalance] = useState("")
  const [lockedBalance, setLockedBalance] = useState(0);
  const [depositedBalance, setDepositedBalance] = useState(0)
  const [derivation, setDerivation] = useState(sessionStorage.getItem('derivation') || "ethereum-1");
  const derivationPath = useDebounce(derivation, 1200);

  const [reloaded, setReloaded] = useState(transactions.length? true : false);

  const childRef = useRef();

  async function getAccountInfo(){
    if(senderAddress!=""){
      const result = await Eth.getContractViewFunction(caETHContract,caETHabi, 'getAccountData', [senderAddress])
      //Demo Path de Yair
      //const result = await Eth.getContractViewFunction(caETHContract,caETHabi, 'getAccountData', ["0x34149390029Bbf4f4D9E7AdEa715D7055e145C05"])
      setLockedBalance(utils.fromWei(result[3],"ether"))
      setDepositedBalance(utils.fromWei(result[2],"ether"))
    }
  }
  
  useEffect(() => {
    // special case for web wallet that reload the whole page
    if (reloaded && senderAddress) signTransaction()

    async function signTransaction() {
      const { big_r, s, recovery_id } = await wallet.getTransactionResult(transactions[0]);
      console.log({ big_r, s, recovery_id });
      const signedTransaction = await Eth.reconstructSignatureFromLocalSession(big_r, s, recovery_id, senderAddress);
      setSignedTransaction(signedTransaction);
      setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
      setStep('relay');

      setReloaded(false);
      removeUrlParams();
    }

  }, [senderAddress]);

  useEffect(() => {
    setSenderLabel('Waiting for you to stop typing...')
    setStatus('Querying Ethereum address and Balance...');
    setSenderAddress(null)
    setStep('request');
  }, [derivation]);

  useEffect(() => {
    setEthAddress()
    console.log(derivationPath)
    async function setEthAddress() {
      const { address } = await Eth.deriveAddress(signedAccountId, derivationPath);
      setSenderAddress(address);
      setSenderLabel(address);

      const balance1 = await Eth.getBalance(address);
      setBalance(balance1)
      if (!reloaded) setStatus(``);
    }
  }, [derivationPath]);



  useEffect(()=>{
    getAccountInfo()
  },[senderAddress])

  async function chainSignature() {
    setStatus('🏗️ Creating transaction');

    const { transaction, payload } = await childRef.current.createPayload();
    // const { transaction, payload } = await Eth.createPayload(senderAddress, receiver, amount, undefined);

    setStatus(`🕒 Asking ${MPC_CONTRACT} to sign the transaction, this might take a while`);
    try {
      const { big_r, s, recovery_id } = await Eth.requestSignatureToMPC(wallet, MPC_CONTRACT, derivationPath, payload, transaction, senderAddress);
      const signedTransaction = await Eth.reconstructSignature(big_r, s, recovery_id, transaction, senderAddress);

      setSignedTransaction(signedTransaction);
      setStatus(`✅ Signed payload ready to be relayed to the Ethereum network`);
      setStep('relay');
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      setLoading(false);
    }
  }

  async function relayTransaction() {
    setLoading(true);
    setStatus('🔗 Relaying transaction to the Ethereum network... this might take a while');

    try {
      const txHash = await Eth.relayTransaction(signedTransaction);
      setStatus(
        <>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank"> ✅ Successful </a>
        </>
      );
      childRef.current.afterRelay();
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
      console.log(e.message)
    }

    setStep('request');
    setLoading(false);
  }

  const UIChainSignature = async () => {
    setLoading(true);
    await chainSignature();
    setLoading(false);
  }

  return (
    <>
      <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Path:</label>
        <div className="col-sm-10">
          <input type="text" className="form-control form-control-sm" value={derivation} onChange={(e) => setDerivation(e.target.value)} disabled={loading} />
          <div className="form-text" id="eth-sender"> {senderLabel} </div>
        </div>
      </div>
      <div className="input-group input-group-sm my-2 mb-4">
        <span className="text-primary input-group-text" id="chain">Action</span>
        <select className="form-select" aria-describedby="chain" onChange={e => setAction(e.target.value)} >
          <option value="function-call"> Ξ Deposit ETH </option>
          <option value="lock"> 🔒 Lock ETH </option>
          <option value="unlock"> 🔓 Unlock ETH </option>
          <option value="withdraw"> Ξ Withdraw ETH </option>
        </select>
      </div>

      {
        action === 'function-call'?
        <FunctionCallForm ref={childRef} props={{ Eth, senderAddress, loading, caETHContract, caETHabi }} />:
        action === 'lock'?
        <LockEthForm ref={childRef} props={{ Eth, senderAddress, loading, caETHContract, caETHabi }} />:
        action === 'unlock'?
        <UnlockEthForm ref={childRef} props={{ Eth, senderAddress, loading, caETHContract, caETHabi }} />:
        <WithdrawForm ref={childRef} props={{ Eth, senderAddress, loading, caETHContract, caETHabi }} />
      }

        <div className="form-text"> The balance of you ETH address is: <b> {balance} </b> </div>
        <div className="form-text"> Your deposited ETH balance is: <b> {depositedBalance} </b> </div>
        <div className="form-text"> Your locked ETH balance is: <b> {lockedBalance} </b> </div>
        <div className="form-text mb-4"> Your caETH  on NEAR is: <b> {lockedBalance} </b> </div>

      <div className="text-center">
        {step === 'request' && <button className="btn btn-primary text-center" onClick={UIChainSignature} disabled={loading}> Request Signature </button>}
        {step === 'relay' && <button className="btn btn-success text-center" onClick={relayTransaction} disabled={loading}> Relay Transaction </button>}
      </div>
    </>
  )

  function removeUrlParams () {
    const url = new URL(window.location.href);
    url.searchParams.delete('transactionHashes');
    window.history.replaceState({}, document.title, url);
  }
}

EthereumView.propTypes = {
  props: PropTypes.shape({
    setStatus: PropTypes.func.isRequired,
    MPC_CONTRACT: PropTypes.string.isRequired,
    transactions: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};