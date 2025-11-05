import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();

    if (!invoice_id) {
      throw new Error("Invoice ID is required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch invoice with related data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        patients(name, contact, address),
        invoice_items(description, quantity, unit_price, total_price),
        payment_history(amount, payment_date, payment_method)
      `)
      .eq("id", invoice_id)
      .single();

    if (invoiceError) throw invoiceError;

    // Generate HTML for PDF
    const html = generateInvoiceHTML(invoice);

    // Use a PDF generation service or library here
    // For now, we'll return a simple base64 encoded response
    // In production, you'd use a service like PDFShift, or a library like Puppeteer
    
    const pdfBase64 = btoa(html); // This is just a placeholder

    return new Response(
      JSON.stringify({
        pdf: pdfBase64,
        invoice_number: invoice.invoice_number,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate PDF" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

function generateInvoiceHTML(invoice: any): string {
  const itemsHTML = invoice.invoice_items
    .map(
      (item: any) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.unit_price.toFixed(2)}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.total_price.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const paymentsHTML = invoice.payment_history
    .map(
      (payment: any) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${new Date(payment.payment_date).toLocaleDateString()}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${payment.payment_method}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${payment.amount.toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const totalPaid = invoice.payment_history.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const balance = invoice.total_amount - totalPaid;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoice_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .hospital-info { font-size: 18px; font-weight: bold; }
        .invoice-details { text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #f2f2f2; border: 1px solid #ddd; padding: 12px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; margin: 5px 0; }
        .total-label { width: 150px; font-weight: bold; }
        .total-value { width: 120px; text-align: right; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="hospital-info">
          <h1>Lavera Hospital</h1>
          <p>123 Medical Center Drive<br>Healthcare City, HC 12345<br>Phone: (555) 123-4567</p>
        </div>
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoice_number}<br>
          <strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}<br>
          <strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}<br>
          <strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
      </div>

      <div class="patient-info">
        <h3>Bill To:</h3>
        <p><strong>${invoice.patients.name}</strong><br>
        ${invoice.patients.address || "Address not provided"}<br>
        Contact: ${invoice.patients.contact}</p>
      </div>

      <h3>Services & Items</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="width: 80px; text-align: center;">Quantity</th>
            <th style="width: 100px; text-align: right;">Unit Price</th>
            <th style="width: 100px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <div class="total-label">Subtotal:</div>
          <div class="total-value">$${invoice.subtotal.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">Tax:</div>
          <div class="total-value">$${invoice.tax_amount.toFixed(2)}</div>
        </div>
        <div class="total-row">
          <div class="total-label">Discount:</div>
          <div class="total-value">-$${invoice.discount_amount.toFixed(2)}</div>
        </div>
        <div class="total-row" style="font-size: 18px; border-top: 2px solid #333; padding-top: 10px;">
          <div class="total-label">Total Amount:</div>
          <div class="total-value"><strong>$${invoice.total_amount.toFixed(2)}</strong></div>
        </div>
        <div class="total-row">
          <div class="total-label">Amount Paid:</div>
          <div class="total-value">-$${totalPaid.toFixed(2)}</div>
        </div>
        <div class="total-row" style="font-size: 16px; color: ${balance > 0 ? "#d9534f" : "#5cb85c"};">
          <div class="total-label">Balance Due:</div>
          <div class="total-value"><strong>$${balance.toFixed(2)}</strong></div>
        </div>
      </div>

      ${
        invoice.payment_history.length > 0
          ? `
      <h3>Payment History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Method</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${paymentsHTML}
        </tbody>
      </table>
      `
          : ""
      }

      ${invoice.notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ""}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
        <p>Thank you for your business!<br>
        For questions about this invoice, please contact our billing department at billing@laverahospital.com</p>
      </div>
    </body>
    </html>
  `;
}
