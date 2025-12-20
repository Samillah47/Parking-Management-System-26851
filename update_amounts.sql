-- Update all ACTIVE and RESERVED reservations with calculated amounts
-- Run this in your PostgreSQL database

UPDATE parking_reservations pr
SET total_amount = ps.hourly_rate * GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NOW() - pr.start_time)) / 3600))
FROM parking_spots ps
WHERE pr.spot_id = ps.spot_id
  AND pr.status IN ('ACTIVE', 'RESERVED')
  AND pr.total_amount IS NULL;

-- Verify the update
SELECT 
    reservation_id,
    status,
    start_time,
    EXTRACT(EPOCH FROM (NOW() - start_time)) / 3600 as hours_parked,
    total_amount
FROM parking_reservations
WHERE status IN ('ACTIVE', 'RESERVED')
ORDER BY start_time;
