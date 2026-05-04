-- Rate limiting table for chat endpoint
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL, -- user_id or IP
  action TEXT NOT NULL, -- 'chat' for now
  count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
  ON rate_limits(identifier, action);

-- Clean up old entries (runs daily via cron or on insert)
ALTER TABLE rate_limits SET (
  row_security = true
);

-- RLS: Users can only read/write their own limits
CREATE POLICY "Users can manage own rate limits" ON rate_limits
  FOR ALL USING (
    identifier = auth.uid()::text 
    OR identifier LIKE 'ip:%'
  );

-- Function to check and increment rate limit
-- Returns (allowed: boolean, remaining: integer, reset_at: timestamptz)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_action TEXT,
  p_limit INTEGER DEFAULT 20,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Get current window
  SELECT window_start INTO v_window_start
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action
  ORDER BY window_start DESC
  LIMIT 1;

  -- If no window or window expired, start new
  IF v_window_start IS NULL OR v_window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, NOW())
    ON CONFLICT (identifier, action) 
    DO UPDATE SET count = 1, window_start = NOW(), updated_at = NOW();
    
    RETURN QUERY SELECT TRUE, p_limit - 1, NOW() + (p_window_seconds || ' seconds')::INTERVAL;
  END IF;

  -- Get current count
  SELECT count INTO v_current_count
  FROM rate_limits
  WHERE identifier = p_identifier AND action = p_action
    AND window_start >= NOW() - (p_window_seconds || ' seconds')::INTERVAL
  ORDER BY window_start DESC
  LIMIT 1;

  v_current_count := COALESCE(v_current_count, 0);

  IF v_current_count >= p_limit THEN
    -- Rate limited
    SELECT window_start + (p_window_seconds || ' seconds')::INTERVAL INTO v_reset_at
    FROM rate_limits
    WHERE identifier = p_identifier AND action = p_action
    ORDER BY window_start DESC
    LIMIT 1;
    
    RETURN QUERY SELECT FALSE, 0, v_reset_at;
  END IF;

  -- Increment and return
  UPDATE rate_limits 
  SET count = count + 1, updated_at = NOW()
  WHERE identifier = p_identifier AND action = p_action
    AND window_start >= NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  IF NOT FOUND THEN
    INSERT INTO rate_limits (identifier, action, count, window_start)
    VALUES (p_identifier, p_action, 1, NOW());
  END IF;

  RETURN QUERY SELECT TRUE, p_limit - v_current_count - 1, v_window_start + (p_window_seconds || ' seconds')::INTERVAL;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;