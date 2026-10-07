CREATE UNIQUE INDEX "uq_users_email_lower"
    ON "users" (lower("email"));

ALTER TABLE users
    ADD CONSTRAINT chk_users_email_format CHECK (position('@' IN email) > 1);

ALTER TABLE children
    ADD CONSTRAINT chk_children_birth_date CHECK (birth_date <= current_date);

ALTER TABLE class_memberships
    ADD CONSTRAINT chk_class_memberships_decided
        CHECK ((status = 'accepted') = (decided_at IS NOT NULL));

ALTER TABLE fundraisings
    ADD CONSTRAINT chk_fundraisings_period CHECK (end_at > start_at),
    ADD CONSTRAINT chk_fundraisings_amount CHECK (amount_per_child > 0),
    ADD CONSTRAINT chk_fundraisings_cancelled
        CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL));

ALTER TABLE wallets
    ADD CONSTRAINT chk_wallets_single_owner
        CHECK (num_nonnulls(user_id, fundraising_id) = 1);

ALTER TABLE transactions
    ADD CONSTRAINT chk_transactions_amount CHECK (amount > 0),
    ADD CONSTRAINT chk_transactions_wallets_differ
        CHECK (from_wallet_id IS DISTINCT FROM to_wallet_id),
    ADD CONSTRAINT chk_transactions_type_wallets CHECK (
        (type = 'deposit' AND from_wallet_id IS NULL AND to_wallet_id IS NOT NULL)
            OR (type = 'withdrawal' AND from_wallet_id IS NOT NULL AND to_wallet_id IS NULL)
            OR (type IN ('payment', 'refund')
            AND from_wallet_id IS NOT NULL AND to_wallet_id IS NOT NULL)
        ),
    ADD CONSTRAINT chk_transactions_completed
        CHECK ((status = 'completed') = (completed_at IS NOT NULL));

ALTER TABLE fundraising_contributions
    ADD CONSTRAINT chk_contributions_distinct_tx
        CHECK (refund_transaction_id IS DISTINCT FROM transaction_id);



CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at         BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_children_updated_at      BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_classes_updated_at       BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fundraisings_updated_at  BEFORE UPDATE ON fundraisings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
