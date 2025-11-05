-- Create pharmacy inventory table
CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'tablets',
  reorder_level INTEGER NOT NULL DEFAULT 10,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  expiry_date DATE,
  manufacturer TEXT,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dispensed medicines tracking table
CREATE TABLE public.dispensed_medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.pharmacy_inventory(id) ON DELETE RESTRICT,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  quantity_dispensed INTEGER NOT NULL,
  dispensed_by UUID NOT NULL REFERENCES auth.users(id),
  dispensed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensed_medicines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_inventory
CREATE POLICY "Staff can view inventory"
ON public.pharmacy_inventory
FOR SELECT
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'pharmacist'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pharmacists can create inventory items"
ON public.pharmacy_inventory
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'pharmacist'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pharmacists can update inventory"
ON public.pharmacy_inventory
FOR UPDATE
USING (
  has_role(auth.uid(), 'pharmacist'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete inventory items"
ON public.pharmacy_inventory
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for dispensed_medicines
CREATE POLICY "Staff can view dispensed medicines"
ON public.dispensed_medicines
FOR SELECT
USING (
  has_role(auth.uid(), 'doctor'::app_role) OR 
  has_role(auth.uid(), 'nurse'::app_role) OR 
  has_role(auth.uid(), 'pharmacist'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Pharmacists can dispense medicines"
ON public.dispensed_medicines
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'pharmacist'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Trigger to update updated_at on pharmacy_inventory
CREATE TRIGGER update_pharmacy_inventory_updated_at
BEFORE UPDATE ON public.pharmacy_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically reduce stock when medicine is dispensed
CREATE OR REPLACE FUNCTION public.reduce_inventory_on_dispense()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.pharmacy_inventory
  SET quantity = quantity - NEW.quantity_dispensed
  WHERE id = NEW.inventory_item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically reduce stock
CREATE TRIGGER trigger_reduce_inventory
AFTER INSERT ON public.dispensed_medicines
FOR EACH ROW
EXECUTE FUNCTION public.reduce_inventory_on_dispense();