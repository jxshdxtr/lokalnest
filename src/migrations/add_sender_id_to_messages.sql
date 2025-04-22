-- Add sender_id column to customer_messages table
ALTER TABLE customer_messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES auth.users(id);

-- Backfill existing data
-- Assume messages from seller to customer when seller_id is present
UPDATE customer_messages 
SET sender_id = seller_id
WHERE sender_id IS NULL;

-- Create an index on sender_id for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_messages_sender_id ON customer_messages(sender_id);

-- Add comment explaining the column
COMMENT ON COLUMN customer_messages.sender_id IS 'The user ID of who sent this message (can be either seller or customer)'; 