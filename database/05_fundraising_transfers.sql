ALTER TYPE "transaction_type" ADD VALUE IF NOT EXISTS 'PAYOUT';
ALTER TYPE "transaction_type" ADD VALUE IF NOT EXISTS 'REPLENISHMENT';

ALTER TABLE transactions
    DROP CONSTRAINT chk_transactions_type_wallets,
    ADD CONSTRAINT chk_transactions_type_wallets CHECK (
        (type = 'DEPOSIT' AND from_wallet_id IS NULL AND to_wallet_id IS NOT NULL)
            OR (type = 'WITHDRAWAL' AND from_wallet_id IS NOT NULL AND to_wallet_id IS NULL)
            OR (type IN ('PAYMENT', 'REFUND', 'PAYOUT', 'REPLENISHMENT')
            AND from_wallet_id IS NOT NULL AND to_wallet_id IS NOT NULL)
        );
