import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Pill, AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: string;
  drug_name: string;
  description: string | null;
  category: string;
  quantity: number;
  unit: string;
  reorder_level: number;
  unit_price: number;
  expiry_date: string | null;
  manufacturer: string | null;
  batch_number: string | null;
}

interface Patient {
  id: string;
  name: string;
}

export default function Pharmacy() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDispenseDialog, setShowDispenseDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    drug_name: "",
    description: "",
    category: "Antibiotic",
    quantity: 0,
    unit: "tablets",
    reorder_level: 10,
    unit_price: 0,
    expiry_date: "",
    manufacturer: "",
    batch_number: "",
  });

  const [dispenseData, setDispenseData] = useState({
    patient_id: "",
    quantity_dispensed: 0,
    notes: "",
  });

  useEffect(() => {
    fetchInventory();
    fetchPatients();
  }, []);

  const fetchInventory = async () => {
    const { data, error } = await supabase
      .from("pharmacy_inventory")
      .select("*")
      .order("drug_name");

    if (error) {
      toast.error("Failed to fetch inventory");
      console.error(error);
    } else {
      setInventory(data || []);
    }
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("id, name")
      .order("name");

    if (error) {
      console.error(error);
    } else {
      setPatients(data || []);
    }
  };

  const handleAddOrUpdate = async () => {
    const dataToSave = {
      ...formData,
      expiry_date: formData.expiry_date || null,
      manufacturer: formData.manufacturer || null,
      batch_number: formData.batch_number || null,
      description: formData.description || null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("pharmacy_inventory")
        .update(dataToSave)
        .eq("id", editingItem.id);

      if (error) {
        toast.error("Failed to update item");
        console.error(error);
      } else {
        toast.success("Item updated successfully");
        setShowAddDialog(false);
        setEditingItem(null);
        resetForm();
        fetchInventory();
      }
    } else {
      const { error } = await supabase
        .from("pharmacy_inventory")
        .insert([dataToSave]);

      if (error) {
        toast.error("Failed to add item");
        console.error(error);
      } else {
        toast.success("Item added successfully");
        setShowAddDialog(false);
        resetForm();
        fetchInventory();
      }
    }
  };

  const handleDispense = async () => {
    if (!selectedItem || !dispenseData.patient_id || dispenseData.quantity_dispensed <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (dispenseData.quantity_dispensed > selectedItem.quantity) {
      toast.error("Insufficient stock");
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error("User not authenticated");
      return;
    }

    const { error } = await supabase
      .from("dispensed_medicines")
      .insert([{
        inventory_item_id: selectedItem.id,
        patient_id: dispenseData.patient_id,
        quantity_dispensed: dispenseData.quantity_dispensed,
        dispensed_by: userData.user.id,
        notes: dispenseData.notes || null,
      }]);

    if (error) {
      toast.error("Failed to dispense medicine");
      console.error(error);
    } else {
      toast.success(`Dispensed ${dispenseData.quantity_dispensed} ${selectedItem.unit} of ${selectedItem.drug_name}`);
      setShowDispenseDialog(false);
      setSelectedItem(null);
      setDispenseData({ patient_id: "", quantity_dispensed: 0, notes: "" });
      fetchInventory();
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      drug_name: item.drug_name,
      description: item.description || "",
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level,
      unit_price: item.unit_price,
      expiry_date: item.expiry_date || "",
      manufacturer: item.manufacturer || "",
      batch_number: item.batch_number || "",
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      drug_name: "",
      description: "",
      category: "Antibiotic",
      quantity: 0,
      unit: "tablets",
      reorder_level: 10,
      unit_price: 0,
      expiry_date: "",
      manufacturer: "",
      batch_number: "",
    });
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Antibiotic", "Painkiller", "Antiseptic", "Vitamin", "Supplement", "Other"];

  return (
    <MainLayout
      title="Pharmacy Inventory"
      subtitle="Manage drugs and medical supplies"
      action={
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingItem(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drug_name">Drug Name *</Label>
                  <Input
                    id="drug_name"
                    value={formData.drug_name}
                    onChange={(e) => setFormData({ ...formData, drug_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablets">Tablets</SelectItem>
                      <SelectItem value="capsules">Capsules</SelectItem>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="mg">MG</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reorder_level">Reorder Level *</Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unit_price">Unit Price *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddOrUpdate}>
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search drugs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.drug_name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                    {item.quantity <= item.reorder_level && (
                      <AlertTriangle className="inline ml-2 h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>${item.unit_price}</TableCell>
                  <TableCell>{item.expiry_date || "N/A"}</TableCell>
                  <TableCell>
                    {item.quantity <= item.reorder_level ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDispenseDialog(true);
                      }}
                    >
                      <Pill className="h-4 w-4 mr-1" />
                      Dispense
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showDispenseDialog} onOpenChange={setShowDispenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispense Medicine</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div>
                <p className="font-semibold">{selectedItem.drug_name}</p>
                <p className="text-sm text-muted-foreground">
                  Available: {selectedItem.quantity} {selectedItem.unit}
                </p>
              </div>
              <div>
                <Label htmlFor="patient">Patient *</Label>
                <Select value={dispenseData.patient_id} onValueChange={(value) => setDispenseData({ ...dispenseData, patient_id: value })}>
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
                <Label htmlFor="quantity_dispensed">Quantity *</Label>
                <Input
                  id="quantity_dispensed"
                  type="number"
                  value={dispenseData.quantity_dispensed}
                  onChange={(e) => setDispenseData({ ...dispenseData, quantity_dispensed: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={dispenseData.notes}
                  onChange={(e) => setDispenseData({ ...dispenseData, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleDispense} className="w-full">
                Dispense Medicine
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
