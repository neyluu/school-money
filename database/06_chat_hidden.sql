ALTER TABLE conversation_read_states
    ADD COLUMN IF NOT EXISTS "hidden_up_to_message_id" INTEGER;
