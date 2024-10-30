# caETH

## Description

`caETH` is a smart contract written in Solidity that allows users to register their Ethereum accounts, deposit Ether, lock and unlock tokens, and withdraw their funds. At the time of lock tokens, the same amount of tokens will be minted in a NEAR contract.

## Features

- **Deposits**: Users can deposit Ether into their account.
- **Withdrawals**: Users can withdraw their available balance.
- **Token Locking**: Users can lock a portion of their balance.
- **Token Unlocking**: Users can unlock locked tokens.
- **Transfer of Locked Tokens**: Users can transfer locked tokens to other accounts.
- **Total Locked Tokens Query**: Users can query the total amount of locked tokens in the contract.
- **Account Data Query**: Users can retrieve information about a specific account.

## Contract Structure

```js
struct AccountData {
    address ETHaddress;
    string nearAccountId;
    uint256 tokenAmount;
    uint256 lockedTokens;
}
```

### Variables

- `accounts`: A mapping that associates each Ethereum address with its corresponding account data.
- `totalLockedTokens`: Stores the total amount of locked tokens in the contract.

### Events

- `AccountDeposit`: Emitted when tokens are deposit.
- `TokensLocked`: Emitted when tokens are locked.
- `TokensUnlocked`: Emitted when tokens are unlocked.
- `LockedTokensTransferred`: Emitted when locked tokens are transferred.
- `TokensWithdrawn`: Emitted when tokens are withdrawn.

### Main Functions

- `deposit(string memory nearAccountId)`: Allows users to deposit Ether and create an account if it doesn't exist.
- `withdraw(uint256 amount)`: Allows users to withdraw Ether from their available balance.
- `lockTokens(uint256 amount)`: Allows users to lock a specified amount of their balance.
- `unlockTokens(uint256 amount)`: Allows users to unlock locked tokens.
- `transferLockedTokens(address to, uint256 amount, string memory nearAccountId)`: Allows users to transfer locked tokens to another account.
- `getTotalLockedTokens()`: Returns the total amount of locked tokens in the contract.
- `getAccountData(address ethAddress)`: Returns the data of a specific account.

## Usage

- **Deployment**: Deploy the contract on the Ethereum network using tools like Remix, Truffle, or Hardhat.
- **Interaction**: Use an Ethereum-compatible wallet (like MetaMask) to interact with the contract and execute its functions.

## Requirements

- Solidity 0.8.0 or higher
- An Ethereum environment (testnet or mainnet)

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
