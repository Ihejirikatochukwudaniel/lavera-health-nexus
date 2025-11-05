-- Fix overly permissive patient and appointment data access
-- Replace the policies that allow any authenticated user to read sensitive data

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Staff can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;

-- Create restricted policies that only allow doctors, nurses, and receptionists
CREATE POLICY "Doctors nurses and receptionists can view patients" 
ON public.patients 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);

CREATE POLICY "Doctors nurses and receptionists can view appointments" 
ON public.appointments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'receptionist'::app_role)
);