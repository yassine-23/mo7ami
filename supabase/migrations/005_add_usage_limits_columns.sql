-- Add client token tracking to conversations and query analytics
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS "client_token" text;

CREATE INDEX IF NOT EXISTS conversations_client_token_idx
ON conversations ("client_token");

ALTER TABLE query_analytics
ADD COLUMN IF NOT EXISTS "user_id" text,
ADD COLUMN IF NOT EXISTS "client_token" text;

CREATE INDEX IF NOT EXISTS query_analytics_user_idx
ON query_analytics ("user_id");

CREATE INDEX IF NOT EXISTS query_analytics_client_idx
ON query_analytics ("client_token");
