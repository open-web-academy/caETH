import { useState, useEffect, useContext } from 'react';
import { utils } from "web3"

import { NearContext } from "../../context";
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useImperativeHandle } from 'react';

export const FunctionCallForm = forwardRef(({ props: { Eth, senderAddress, loading, caETHContract, caETHabi } }, ref) => {
  const { wallet, signedAccountId } = useContext(NearContext);
  const [amount, setAmount] = useState(0.005);

  useImperativeHandle(ref, () => ({
    async createPayload() {
      const data = Eth.createTransactionData(caETHContract, caETHabi, 'deposit', [signedAccountId]);
      console.log(data)
      const { transaction, payload } = await Eth.createPayload(senderAddress, caETHContract, amount, data);
      console.log(transaction,payload)
      return { transaction, payload };
    },

    async afterRelay() {
      getNumber();
    }
  }));

  return (
    <>
      <h5 className="text-center">Deposit ETH</h5>
      <div className="row mb-3">
        <label className="col-sm-2 col-form-label col-form-label-sm">Amount:</label>
        <div className="col-sm-10">
          <input type="number" className="form-control form-control-sm" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" disabled={loading} />
          <div className="form-text"> Ethereum units </div>
        </div>
      </div>
        
      
    </>
  );
});

FunctionCallForm.propTypes = {
  props: PropTypes.shape({
    senderAddress: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    Eth: PropTypes.shape({
      createPayload: PropTypes.func.isRequired,
      createTransactionData: PropTypes.func.isRequired,
      getContractViewFunction: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired
};

FunctionCallForm.displayName = 'EthereumContractView';