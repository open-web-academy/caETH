/*!
Fungible Token implementation with JSON serialization.
NOTES:
  - The maximum balance value is limited by U128 (2**128 - 1).
  - JSON calls should pass U128 as a base-10 string. E.g. "100".
  - The contract optimizes the inner trie structure by hashing account IDs. It will prevent some
    abuse of deep tries. Shouldn't be an issue, once NEAR clients implement full hashing of keys.
  - The contract tracks the change in storage before and after the call. If the storage increases,
    the contract requires the caller of the contract to attach enough deposit to the function call
    to cover the storage cost.
    This is done to prevent a denial of service attack on the contract by taking all available storage.
    If the storage decreases, the contract will issue a refund for the cost of the released storage.
    The unused tokens from the attached deposit are also refunded, so it's safe to
    attach more deposit than required.
  - To prevent the deployed contract from being modified or deleted, it should not have any access
    keys on its account.
*/
use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_contract_standards::fungible_token::FungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LazyOption;
use near_sdk::json_types::U128;
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, PromiseOrValue};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[near_bindgen]
impl Contract {
    /// Initializes the contract with the given total supply owned by the given `owner_id` with
    /// default metadata (for example purposes only).
    #[init]
    pub fn new_default_meta(owner_id: AccountId, total_supply: U128) -> Self {
        Self::new(
            owner_id,
            total_supply,
            FungibleTokenMetadata {
                spec: FT_METADATA_SPEC.to_string(),
                name: "Chain Abstraction ETH".to_string(),
                symbol: "caETH".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                reference: None,
                reference_hash: None,
                decimals: 24,
            },
        )
    }

    /// Initializes the contract with the given total supply owned by the given `owner_id` with
    /// the given fungible token metadata.
    #[init]
    pub fn new(
        owner_id: AccountId,
        total_supply: U128,
        metadata: FungibleTokenMetadata,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut this = Self {
            token: FungibleToken::new(b"a".to_vec()),
            metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
        };
        this.token.internal_register_account(&owner_id);
        this.token.internal_deposit(&owner_id, total_supply.into());
        near_contract_standards::fungible_token::events::FtMint {
            owner_id: &owner_id,
            amount: &total_supply,
            memo: Some("Initial tokens supply is minted"),
        }
        .emit();
        this
    }
    
    // Recover ETH smart contract state
    pub fn validate_eth(&mut self, account_id: AccountId) {
        //Recover current ETH contract state
        
        // add a balance of mintable caeth into callers account

        //
        log!("Looking for balance on @{}", account_id);
    }
    //Method to receive caETH and burn it
    /*
    pub fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let msg_json: MsgInput = from_str(&msg).unwrap();
        let deposit = amount.0;
        let user_account = env::signer_account_id();

        log!("Deposit: {:?}",amount);
        
        env::log(
            json!(msg_json.clone())
            .to_string()
            .as_bytes(),
        );
         
        match msg_json.action_to_execute.as_str() {
            "burn_caeth" => {

                assert!(deposit % 1_000_000_000_000_000_000 == 0, "Deposit must be integer");
                assert!(amount.0 >= 10000000000000000000000, "Deposit must be a minimum of 10,000 $HAT");

                
                env::log_str("Processing deposit of tokens"); 
                assert_eq!(self.ft_token_id, env::predecessor_account_id(), "This token is not accepted.");

                log!("The new countdown period is: {}", self.countdown_period);
    
                // Send FT tokens to treasury as fee
                let covered_fees = amount.0 * self.treasury_fee / 100;

                ft_contract::ft_transfer(
                    "000000000000000000000000000000",
                    U128::from(covered_fees.clone()),
                    None,
                    self.ft_token_id.clone(),
                    1,
                    Gas(100_000_000_000_000)
                );
    
                log!("Deposit to fees: {}", covered_fees);
    
                // Calculate deposit without fees
                let deposit_without_fees = amount.0 * (100-self.treasury_fee) / 100;
                log!("Deposit to vault: {}", deposit_without_fees);
    
                // Update balance of active vault
                self.ft_token_balance += amount.0;
                log!("The new vault balance is: {}", self.ft_token_balance);
    
                // Update the active vault with the new deposit, user account and date end
                active_vault.winner = user_account.clone();
                active_vault.token_amount += deposit_without_fees;
                active_vault.token_amount_complete += amount.0;
                active_vault.date_end = self.countdown_period;
                
                self.time_last_deposit = current_timestamp;
                self.account_last_deposit = user_account;

                self.highest_deposit = if deposit > self.highest_deposit {
                    deposit
                } else {
                    self.highest_deposit
                };

                self.vaults.replace(active_vault_index.try_into().unwrap(), &active_vault);
    
                // Guardar la información del depósito en el historial
                self.deposit_history.insert(&DepositInfo {
                    account_id: self.account_last_deposit.clone(),
                    date: self.time_last_deposit,
                    ft_amount: amount.0.to_string(),
                    deposit_or_withdraw: true,
                });
    
                PromiseOrValue::Value(U128::from(0))
            }
            _ => PromiseOrValue::Value(U128::from(amount)),
        }
        
    }*/

    
    // Mint total balance of caETH pending 
    // Minimum of caETH to be minted 
    pub fn mint_caeth(&mut self, account_id: AccountId, balance: Balance) {
        //validate current amount of caETH available to be minted
        
        //mint caETH into callers accounts
        self.token.internal_deposit(&account_id, balance.into());
        near_contract_standards::fungible_token::events::FtMint {
            owner_id: &account_id,
            amount: &balance.into(),
            memo: Some("caETH supply is minted"),
        }
        .emit();

        log!("Minting available @{} caETH to {}", balance, account_id);
    }
    
    fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
        log!("Closed @{} with {}", account_id, balance);
    }

    fn on_tokens_burned(&mut self, account_id: AccountId, amount: Balance) {
        log!("Account @{} burned {}", account_id, amount);
    }
}

near_contract_standards::impl_fungible_token_core!(Contract, token, on_tokens_burned);
near_contract_standards::impl_fungible_token_storage!(Contract, token, on_account_closed);

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, Balance};

    use super::*;

    const TOTAL_SUPPLY: Balance = 1_000_000_000_000_000;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new_default_meta(accounts(1).into(), TOTAL_SUPPLY.into());
        testing_env!(context.is_view(true).build());
        assert_eq!(contract.ft_total_supply().0, TOTAL_SUPPLY);
        assert_eq!(contract.ft_balance_of(accounts(1)).0, TOTAL_SUPPLY);
    }

    #[test]
    #[should_panic(expected = "The contract is not initialized")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    #[test]
    fn test_transfer() {
        let mut context = get_context(accounts(2));
        testing_env!(context.build());
        let mut contract = Contract::new_default_meta(accounts(2).into(), TOTAL_SUPPLY.into());
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(contract.storage_balance_bounds().min.into())
            .predecessor_account_id(accounts(1))
            .build());
        // Paying for account registration, aka storage deposit
        contract.storage_deposit(None, None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(2))
            .build());
        let transfer_amount = TOTAL_SUPPLY / 3;
        contract.ft_transfer(accounts(1), transfer_amount.into(), None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert_eq!(contract.ft_balance_of(accounts(2)).0, (TOTAL_SUPPLY - transfer_amount));
        assert_eq!(contract.ft_balance_of(accounts(1)).0, transfer_amount);
    }
}
