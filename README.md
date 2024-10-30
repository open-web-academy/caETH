# Chain Abstracted Ethereum (caETH)

caETH is a non-custodial representation of Ethereum on the NEAR Protocol, designed to facilitate interoperability between the two networks. Each caETH is paired 1:1 with ETH, ensuring that users have direct access to their assets without custody risks.

## Features

- **1:1 Pairing**: caETH is directly linked to ETH, allowing for straightforward conversions.
- **Non-Custodial**: Users retain full control over their assets without relying on third parties.
- **NEP-141 Standard**: caETH is minted as a NEP-141 token on NEAR, ensuring compatibility with the NEAR ecosystem.

## User Stories

1. **Depositing ETH**:
   - The user is able to deposit ETH on ethereum and mint caETH on NEAR Protocol to an indicated wallet.
   
2. **Redeeming ETH**:
   - The user is able to burn caETH on NEAR Protocol and redeem ETH on Ethereum Network to an indicated wallet.

## User Journey

1. **Locking ETH**:
   - The user locks their ETH tokens in a smart contract on Ethereum and specifies a NEAR address for the corresponding caETH.

2. **Data Reading**:
   - The NEAR smart contract reads the data from the Ethereum smart contract to verify the lock.

3. **Minting caETH**:
   - The user can now mint caETH natively on a smart contract on NEAR, using their locked ETH as collateral.

## Chart

<img src="https://i.ibb.co/fkwk0Gy/diagrama.png" width="100%">


