-- Create invoice status enum
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');

-- Create billing items table (line items for invoices)
CREATE TABLE public.billing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL, -- e.g., 'consultation', 'medication', 'lab_test', 'procedure'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  patient_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  status invoice_status DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoice line items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  billing_item_id UUID REFERENCES public.billing_items(id),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment history table
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL, -- e.g., 'cash', 'card', 'insurance', 'bank_transfer'
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reference_number TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_items
CREATE POLICY "Staff can view billing items"
ON public.billing_items FOR SELECT
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create billing items"
ON public.billing_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update billing items"
ON public.billing_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete billing items"
ON public.billing_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for invoices
CREATE POLICY "Staff can view invoices"
ON public.invoices FOR SELECT
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can create invoices"
ON public.invoices FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can update invoices"
ON public.invoices FOR UPDATE
USING (has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoices"
ON public.invoices FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for invoice_items
CREATE POLICY "Staff can view invoice items"
ON public.invoice_items FOR SELECT
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can create invoice items"
ON public.invoice_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can update invoice items"
ON public.invoice_items FOR UPDATE
USING (has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invoice items"
ON public.invoice_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for payment_history
CREATE POLICY "Staff can view payment history"
ON public.payment_history FOR SELECT
USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can create payment records"
ON public.payment_history FOR INSERT
WITH CHECK (has_role(auth.uid(), 'receptionist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payment records"
ON public.payment_history FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_billing_items_updated_at
BEFORE UPDATE ON public.billing_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := TO_CHAR(CURRENT_DATE, 'YYYYMM');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV' || year_month || '%';
  
  new_number := 'INV' || year_month || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM public.invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    total_amount = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM public.invoice_items
      WHERE invoice_id = NEW.invoice_id
    ) + (SELECT tax_amount - discount_amount FROM public.invoices WHERE id = NEW.invoice_id)
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_invoice_totals_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();