import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Download, Search, Filter } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  patients?: { name: string } | null;
}

const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newInvoice, setNewInvoice] = useState({
    patient_id: "",
    due_days: 30,
    notes: "",
  });

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, [statusFilter, dateFilter]);

  const fetchInvoices = async () => {
    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter as any);
    }

    if (dateFilter) {
      const startDate = new Date(dateFilter);
      const endDate = new Date(dateFilter);
      endDate.setMonth(endDate.getMonth() + 1);
      query = query.gte("issue_date", startDate.toISOString()).lt("issue_date", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } else {
      // Fetch patient names separately
      const invoicesWithPatients = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: patient } = await supabase
            .from("patients")
            .select("name")
            .eq("id", invoice.patient_id)
            .single();
          return { ...invoice, patients: patient };
        })
      );
      setInvoices(invoicesWithPatients);
    }
  };

  const fetchPatients = async () => {
    const { data } = await supabase.from("patients").select("*").order("name");
    setPatients(data || []);
  };

  const handleCreateInvoice = async () => {
    setIsLoading(true);

    try {
      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number");

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + newInvoice.due_days);

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        patient_id: newInvoice.patient_id,
        due_date: dueDate.toISOString().split("T")[0],
        notes: newInvoice.notes,
        created_by: userData.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewInvoice({ patient_id: "", due_days: 30, notes: "" });
      fetchInvoices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice_id: invoiceId },
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${data.invoice_number}.pdf`;
      a.click();

      toast({
        title: "Success",
        description: "Invoice PDF downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      paid: "default",
      overdue: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status.toUpperCase()}</Badge>;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.patients?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <MainLayout title="Invoices">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by invoice # or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Patient</Label>
                  <Select value={newInvoice.patient_id} onValueChange={(value) => setNewInvoice({ ...newInvoice, patient_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Due (days)</Label>
                  <Input
                    type="number"
                    value={newInvoice.due_days}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_days: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
                <Button onClick={handleCreateInvoice} disabled={isLoading || !newInvoice.patient_id} className="w-full">
                  {isLoading ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter((i) => i.status === "pending").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.filter((i) => i.status === "paid").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{invoices.filter((i) => i.status === "overdue").length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.patients?.name}</TableCell>
                    <TableCell>{format(new Date(invoice.issue_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleExportPDF(invoice.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Invoices;
