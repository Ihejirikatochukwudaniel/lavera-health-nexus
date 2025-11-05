-- Add DELETE policies for all tables with appropriate role-based restrictions

-- Patients: Allow doctors and nurses to delete (soft delete recommended for production)
CREATE POLICY "Doctors and nurses can delete patients"
ON public.patients
FOR DELETE
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role));

-- Appointments: Allow staff to delete appointments
CREATE POLICY "Staff can delete appointments"
ON public.appointments
FOR DELETE
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role));

-- Medical Records: Only doctors can delete (highly sensitive)
CREATE POLICY "Doctors can delete medical records"
ON public.medical_records
FOR DELETE
USING (has_role(auth.uid(), 'doctor'::app_role));

-- Lab Results: Lab techs and doctors can delete
CREATE POLICY "Lab techs and doctors can delete lab results"
ON public.lab_results
FOR DELETE
USING (has_role(auth.uid(), 'lab_tech'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

-- Profiles: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- User Roles: Only admins can delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Audit Logs: No DELETE allowed (compliance requirement)
-- Audit logs should never be deleted to maintain compliance trail