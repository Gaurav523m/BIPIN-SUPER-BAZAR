-- This migration adds the reorder_point column to the inventory table
ALTER TABLE IF EXISTS "inventory" ADD COLUMN IF NOT EXISTS "reorder_point" INTEGER;