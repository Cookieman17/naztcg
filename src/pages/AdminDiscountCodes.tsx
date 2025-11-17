import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Percent, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minimumOrder: number;
  maxUses: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isStackable: boolean;
  createdAt: string;
}

const AdminDiscountCodes = () => {
  const { toast } = useToast();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: '',
    minimumOrder: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isStackable: false
  });

  // Load discount codes from localStorage
  useEffect(() => {
    const savedCodes = localStorage.getItem('adminDiscountCodes');
    if (savedCodes) {
      setDiscountCodes(JSON.parse(savedCodes));
    }
  }, []);

  // Save discount codes to localStorage
  const saveDiscountCodes = (codes: DiscountCode[]) => {
    localStorage.setItem('adminDiscountCodes', JSON.stringify(codes));
    setDiscountCodes(codes);
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('discountCodesUpdated'));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimumOrder: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      isActive: true,
      isStackable: false
    });
    setEditingCode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.description || (!formData.value && formData.type !== 'free_shipping')) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if code already exists (except when editing)
    const codeExists = discountCodes.some(code => 
      code.code.toLowerCase() === formData.code.toLowerCase() && 
      (!editingCode || code.id !== editingCode.id)
    );

    if (codeExists) {
      toast({
        title: "Code Exists",
        description: "A discount code with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    const discountCodeData: DiscountCode = {
      id: editingCode ? editingCode.id : `DISCOUNT-${Date.now()}`,
      code: formData.code.toUpperCase(),
      description: formData.description,
      type: formData.type,
      value: formData.type === 'free_shipping' ? 0 : parseFloat(formData.value),
      minimumOrder: parseFloat(formData.minimumOrder) || 0,
      maxUses: parseInt(formData.maxUses) || 0,
      currentUses: editingCode ? editingCode.currentUses : 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      isStackable: formData.isStackable,
      createdAt: editingCode ? editingCode.createdAt : new Date().toISOString()
    };

    let newCodes;
    if (editingCode) {
      newCodes = discountCodes.map(code => 
        code.id === editingCode.id ? discountCodeData : code
      );
      toast({
        title: "Code Updated",
        description: `Discount code "${discountCodeData.code}" has been updated.`,
      });
    } else {
      newCodes = [...discountCodes, discountCodeData];
      toast({
        title: "Code Created",
        description: `Discount code "${discountCodeData.code}" has been created.`,
      });
    }

    saveDiscountCodes(newCodes);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description,
      type: code.type,
      value: code.type === 'free_shipping' ? '' : code.value.toString(),
      minimumOrder: code.minimumOrder.toString(),
      maxUses: code.maxUses.toString(),
      startDate: code.startDate,
      endDate: code.endDate,
      isActive: code.isActive,
      isStackable: code.isStackable || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const codeToDelete = discountCodes.find(code => code.id === id);
    if (window.confirm(`Are you sure you want to delete the discount code "${codeToDelete?.code}"?`)) {
      const newCodes = discountCodes.filter(code => code.id !== id);
      saveDiscountCodes(newCodes);
      toast({
        title: "Code Deleted",
        description: "Discount code has been deleted.",
      });
    }
  };

  const toggleStatus = (id: string) => {
    const newCodes = discountCodes.map(code =>
      code.id === id ? { ...code, isActive: !code.isActive } : code
    );
    saveDiscountCodes(newCodes);
    toast({
      title: "Status Updated",
      description: "Discount code status has been updated.",
    });
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'free_shipping') return 'Free Shipping';
    return type === 'percentage' ? `${value}%` : `£${value.toFixed(2)}`;
  };

  const isExpired = (endDate: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isNotStarted = (startDate: string) => {
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Discount Codes</h1>
          <p className="text-muted-foreground">Manage promotional discount codes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Edit Discount Code' : 'Create New Discount Code'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                      <SelectItem value="free_shipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="20% off all trading cards"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.type !== 'free_shipping' && (
                  <div>
                    <Label htmlFor="value">
                      {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (£)'} *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      step={formData.type === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                      placeholder={formData.type === 'percentage' ? '20' : '10.00'}
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="minimumOrder">Minimum Order (£)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUses">Max Uses (0 = unlimited)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="0"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isStackable"
                      checked={formData.isStackable}
                      onChange={(e) => setFormData(prev => ({ ...prev, isStackable: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isStackable">Stackable with other discounts</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCode ? 'Update Code' : 'Create Code'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Codes</p>
              <p className="text-2xl font-bold">{discountCodes.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Codes</p>
              <p className="text-2xl font-bold">
                {discountCodes.filter(code => code.isActive && !isExpired(code.endDate) && !isNotStarted(code.startDate)).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Edit2 className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Uses</p>
              <p className="text-2xl font-bold">
                {discountCodes.reduce((sum, code) => sum + code.currentUses, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold">
                {discountCodes.filter(code => isExpired(code.endDate)).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Discount Codes List */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">All Discount Codes</h2>
          {discountCodes.length === 0 ? (
            <div className="text-center py-8">
              <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discount codes yet</p>
              <p className="text-sm text-muted-foreground">Create your first discount code to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discountCodes.map((code) => (
                <div key={code.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{code.code}</h3>
                        <Badge variant={code.isActive ? 'default' : 'secondary'}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isExpired(code.endDate) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                        {isNotStarted(code.startDate) && (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                        {code.isStackable && (
                          <Badge variant="secondary">Stackable</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-2">{code.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Discount:</span>
                          <p>{formatValue(code.type, code.value)}</p>
                        </div>
                        {code.minimumOrder > 0 && (
                          <div>
                            <span className="font-medium">Min Order:</span>
                            <p>£{code.minimumOrder.toFixed(2)}</p>
                          </div>
                        )}
                        {code.maxUses > 0 && (
                          <div>
                            <span className="font-medium">Uses:</span>
                            <p>{code.currentUses} / {code.maxUses}</p>
                          </div>
                        )}
                        {code.startDate && (
                          <div>
                            <span className="font-medium">Start:</span>
                            <p>{new Date(code.startDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        {code.endDate && (
                          <div>
                            <span className="font-medium">End:</span>
                            <p>{new Date(code.endDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(code.id)}
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(code)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(code.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDiscountCodes;