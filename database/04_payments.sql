ALTER TABLE wallets
    ADD CONSTRAINT chk_wallets_balance CHECK (balance >= 0);
