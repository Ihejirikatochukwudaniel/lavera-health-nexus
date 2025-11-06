-- Add medical_history column to patients table
ALTER TABLE public.patients 
ADD COLUMN medical_history text;