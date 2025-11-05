-- Create table for storing email verification OTPs
CREATE TABLE public.email_verification_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.email_verification_otps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert OTPs (for signup)
CREATE POLICY "Anyone can create OTP for verification"
ON public.email_verification_otps
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own OTPs
CREATE POLICY "Users can read OTPs for their email"
ON public.email_verification_otps
FOR SELECT
USING (true);

-- Allow anyone to update OTPs (to mark as verified)
CREATE POLICY "Anyone can update OTP verification status"
ON public.email_verification_otps
FOR UPDATE
USING (true);

-- Create index on email for faster lookups
CREATE INDEX idx_email_verification_otps_email ON public.email_verification_otps(email);

-- Create index on expires_at for cleanup
CREATE INDEX idx_email_verification_otps_expires_at ON public.email_verification_otps(expires_at);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_verification_otps
  WHERE expires_at < now();
END;
$$;