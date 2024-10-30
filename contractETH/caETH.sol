// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract caETH {
    /**
     * @dev Structure to store information related to each account.
     * - `ETHaddress`: The Ethereum address of the account holder.
     * - `nearAccountId`: The NEAR account ID linked to the Ethereum account.
     * - `tokenAmount`: The total balance of tokens deposited by the account.
     * - `lockedTokens`: The total amount of tokens that are currently locked.
     */
    struct AccountData {
        address ETHaddress;
        string nearAccountId;
        uint256 tokenAmount;
        uint256 lockedTokens;
    }

    // Mapping that associates each Ethereum address with its corresponding account data
    mapping(address => AccountData) public accounts;

    // Global variable to store the cumulative amount of locked tokens across all accounts
    uint256 public totalLockedTokens;

    // Events to log deposits, locks, unlocks, and transfers for auditing and monitoring
    event AccountDeposit(
        address indexed ETHaddress,
        string nearAccountId,
        uint256 newDeposit,
        uint256 totalBalance
    );
    event TokensLocked(
        address indexed ETHaddress,
        uint256 amountLocked,
        uint256 totalLocked,
        uint256 globalLocked
    );
    event TokensUnlocked(
        address indexed ETHaddress,
        uint256 amountUnlocked,
        uint256 totalLocked,
        uint256 totalBalance
    );
    event LockedTokensTransferred(
        address indexed fromETH,
        address indexed toETH,
        uint256 amountTransferred
    );

    function deposit(string memory nearAccountId) external payable {
        require(msg.value > 0, "Deposit must be greater than zero");

        AccountData storage account = accounts[msg.sender];

        if (bytes(account.nearAccountId).length == 0) {
            // If account does not exist, create a new entry
            account.ETHaddress = msg.sender;
            account.nearAccountId = nearAccountId;
            account.tokenAmount = msg.value;
        } else {
            // If the account exists, update the token balance
            require(
                keccak256(abi.encodePacked(account.nearAccountId)) ==
                    keccak256(abi.encodePacked(nearAccountId)),
                "nearAccountId does not match the stored account"
            );
            account.tokenAmount += msg.value;
        }

        // Emit an event to log the account registration and deposit details
        emit AccountDeposit(
            msg.sender,
            nearAccountId,
            msg.value,
            account.tokenAmount
        );
    }

    function withdraw(uint256 amount) external {
        AccountData storage account = accounts[msg.sender];

        // Verifica que la cuenta exista
        require(account.ETHaddress != address(0), "Account does not exist");

        // Verifica que haya suficiente saldo disponible para retirar
        require(
            account.tokenAmount >= amount,
            "Insufficient token balance to withdraw"
        );
        require(amount > 0, "Amount must be greater than zero");

        // Actualiza el saldo de la cuenta
        account.tokenAmount -= amount;

        // Transfiere la cantidad especificada al usuario
        payable(msg.sender).transfer(amount);

        // Emitir un evento para registrar el retiro
        emit TokensUnlocked(
            msg.sender,
            amount,
            account.lockedTokens,
            account.tokenAmount
        );
    }

    function lockTokens(uint256 amount) external {
        AccountData storage account = accounts[msg.sender];

        require(account.ETHaddress != address(0), "Account does not exist");

        require(
            account.tokenAmount >= amount,
            "Insufficient available balance to lock"
        );
        require(amount > 0, "Amount to lock must be greater than zero");

        // Deduct the amount from available balance and add to locked tokens
        account.tokenAmount -= amount;
        account.lockedTokens += amount;

        // Update global total of locked tokens
        totalLockedTokens += amount;

        // Emit an event to log the locking action
        emit TokensLocked(
            msg.sender,
            amount,
            account.lockedTokens,
            totalLockedTokens
        );
    }

    function unlockTokens(uint256 amount) external {
        AccountData storage account = accounts[msg.sender];

        require(account.ETHaddress != address(0), "Account does not exist");

        // Verifica que hay suficientes tokens bloqueados para desbloquear
        require(
            account.lockedTokens >= amount,
            "Insufficient locked tokens to unlock"
        );
        require(amount > 0, "Amount to unlock must be greater than zero");

        // Deduce la cantidad de tokens bloqueados y añade a los disponibles
        account.lockedTokens -= amount;
        totalLockedTokens -= amount;
        account.tokenAmount += amount;

        // Emite un evento para registrar la acción de desbloqueo
        emit TokensUnlocked(
            msg.sender,
            amount,
            account.lockedTokens,
            account.tokenAmount
        );
    }

    function transferLockedTokens(
        address to,
        uint256 amount,
        string memory nearAccountId
    ) external {
        require(to != address(0), "Recipient address cannot be zero");
        require(msg.sender != to, "Sender and recipient cannot be the same");

        AccountData storage senderAccount = accounts[msg.sender];
        AccountData storage recipientAccount = accounts[to];

        require(
            senderAccount.lockedTokens >= amount,
            "Insufficient locked tokens to transfer"
        );
        require(amount > 0, "Amount to transfer must be greater than zero");

        // Deduct the locked tokens from the sender's account
        senderAccount.lockedTokens -= amount;

        // If recipient account does not exist, create it with provided nearAccountId
        if (bytes(recipientAccount.nearAccountId).length == 0) {
            recipientAccount.ETHaddress = to;
            recipientAccount.nearAccountId = nearAccountId;
            recipientAccount.tokenAmount = 0;
            recipientAccount.lockedTokens = amount;
        } else {
            // Check if nearAccountId matches the stored ID
            require(
                keccak256(abi.encodePacked(recipientAccount.nearAccountId)) ==
                    keccak256(abi.encodePacked(nearAccountId)),
                "nearAccountId does not match the stored account"
            );

            // Add the transferred amount to the recipient's locked tokens
            recipientAccount.lockedTokens += amount;
        }

        // Emit an event to log the locked token transfer
        emit LockedTokensTransferred(msg.sender, to, amount);
    }

    function getTotalLockedTokens() external view returns (uint256) {
        return totalLockedTokens;
    }

    function getAccountData(address ethAddress)
        external
        view
        returns (AccountData memory)
    {
        return accounts[ethAddress];
    }
}

