import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail,
  User,
  Calendar,
  ShoppingCart,
  DollarSign
} from \"lucide-react\";\nimport { firebaseCustomerService } from \"@/lib/firebase-customers\";\n\ninterface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  status: 'active' | 'inactive';
  orders: Array<{
    id: string;
    total: number;
    date: string;
    status: string;
  }>;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
    
    // Subscribe to real-time updates
    const unsubscribe = firebaseCustomerService.subscribeToCustomers((customersData) => {
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      console.log('🔥 Customers: Real-time update received');
    });
    
    return () => unsubscribe();
  }, []);
  
  const loadCustomers = async () => {
    try {
      console.log('🔥 Customers: Loading from Firebase...');
      const customersData = await firebaseCustomerService.getCustomers();
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    const customerMap = new Map<string, Customer>();

    orders.forEach((order: any) => {
      const customerId = order.email;
      
      if (customerMap.has(customerId)) {
        const customer = customerMap.get(customerId)!;
        customer.totalOrders++;
        customer.totalSpent += order.total;
        customer.lastOrderDate = order.createdAt;
        customer.orders.push({
          id: order.id,
          total: order.total,
          date: order.createdAt,
          status: order.status
        });
      } else {
        customerMap.set(customerId, {
          id: customerId,
          name: order.customerName || order.email,
          email: order.email,
          totalOrders: 1,
          totalSpent: order.total,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
          status: 'active' as const,
          orders: [{
            id: order.id,
            total: order.total,
            date: order.createdAt,
            status: order.status
          }]
        });
      }
    });

    const customersArray = Array.from(customerMap.values())
      .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
    
    setCustomers(customersArray);
    setFilteredCustomers(customersArray);

    // Save to localStorage for persistence
    localStorage.setItem("adminCustomers", JSON.stringify(customersArray));
  }, []);

  useEffect(() => {
    // Filter customers based on search
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 500) return { tier: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent >= 200) return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalSpent >= 50) return { tier: 'Silver', color: 'bg-gray-100 text-gray-800' };
    return { tier: 'Bronze', color: 'bg-orange-100 text-orange-800' };
  };

  const exportCustomers = () => {
    const csv = [
      ['Name', 'Email', 'Total Orders', 'Total Spent', 'First Order', 'Last Order'],
      ...filteredCustomers.map(customer => [
        customer.name,
        customer.email,
        customer.totalOrders,
        customer.totalSpent,
        formatDate(customer.firstOrderDate),
        formatDate(customer.lastOrderDate)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage customer relationships and data</p>
        </div>
        <Button onClick={exportCustomers} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customers.reduce((sum, c) => sum + c.totalSpent, 0) / 
                    customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VIP Customers</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.totalSpent >= 500).length}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.totalOrders > 1).length}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const tier = getCustomerTier(customer.totalSpent);
            return (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{customer.name}</h3>
                        <Badge className={`${tier.color} text-xs`}>
                          {tier.tier}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-gray-400" />
                          <span>{customer.totalOrders} order{customer.totalOrders !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Last: {formatDate(customer.lastOrderDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Customers will appear here after they place orders"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>{selectedCustomer.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Name:</strong> {selectedCustomer.name}</p>
                  <p><strong>Email:</strong> {selectedCustomer.email}</p>
                  <p><strong>Customer Since:</strong> {formatDate(selectedCustomer.firstOrderDate)}</p>
                  <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</p>
                  <p><strong>Total Spent:</strong> {formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p><strong>Tier:</strong> 
                    <Badge className={`ml-2 ${getCustomerTier(selectedCustomer.totalSpent).color}`}>
                      {getCustomerTier(selectedCustomer.totalSpent).tier}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-semibold mb-2">Order History</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCustomer.orders
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.total)}</p>
                        <Badge className={`text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedCustomer(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;