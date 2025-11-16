import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings as SettingsIcon, 
  Store, 
  CreditCard, 
  Mail, 
  Truck,
  Save,
  CheckCircle
} from "lucide-react";

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  supportEmail: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  business: {
    vatNumber: string;
    companyNumber: string;
    taxRate: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expeditedShippingCost: number;
  };
  payments: {
    stripePublishableKey: string;
    paypalEnabled: boolean;
    bankTransferEnabled: boolean;
  };
  notifications: {
    orderEmails: boolean;
    lowStockAlerts: boolean;
    customerEmails: boolean;
  };
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: "NAZ TCG",
    storeDescription: "Professional trading card grading and authentication services",
    contactEmail: "contact@naztcg.co.uk",
    supportEmail: "support@naztcg.co.uk",
    phone: "+44 1234 567890",
    address: {
      street: "123 Trading Card Lane",
      city: "London",
      postcode: "SW1A 1AA",
      country: "United Kingdom"
    },
    business: {
      vatNumber: "GB123456789",
      companyNumber: "12345678",
      taxRate: 20
    },
    shipping: {
      freeShippingThreshold: 50,
      standardShippingCost: 4.99,
      expeditedShippingCost: 9.99
    },
    payments: {
      stripePublishableKey: "pk_test_...",
      paypalEnabled: false,
      bankTransferEnabled: true
    },
    notifications: {
      orderEmails: true,
      lowStockAlerts: true,
      customerEmails: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage
    localStorage.setItem("adminSettings", JSON.stringify(settings));
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your store settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Success Alert */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Store Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Store Information
          </CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Store Name</label>
              <Input
                value={settings.storeName}
                onChange={(e) => updateSettings('storeName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contact Email</label>
              <Input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => updateSettings('contactEmail', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Store Description</label>
            <Textarea
              value={settings.storeDescription}
              onChange={(e) => updateSettings('storeDescription', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Support Email</label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSettings('supportEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={settings.phone}
                onChange={(e) => updateSettings('phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle>Business Address</CardTitle>
          <CardDescription>Your registered business address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Street Address</label>
            <Input
              value={settings.address.street}
              onChange={(e) => updateSettings('address.street', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                value={settings.address.city}
                onChange={(e) => updateSettings('address.city', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Postcode</label>
              <Input
                value={settings.address.postcode}
                onChange={(e) => updateSettings('address.postcode', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input
                value={settings.address.country}
                onChange={(e) => updateSettings('address.country', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
          <CardDescription>Legal and tax information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">VAT Number</label>
              <Input
                value={settings.business.vatNumber}
                onChange={(e) => updateSettings('business.vatNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company Number</label>
              <Input
                value={settings.business.companyNumber}
                onChange={(e) => updateSettings('business.companyNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tax Rate (%)</label>
              <Input
                type="number"
                value={settings.business.taxRate}
                onChange={(e) => updateSettings('business.taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Settings
          </CardTitle>
          <CardDescription>Configure shipping costs and thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Free Shipping Threshold (£)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) => updateSettings('shipping.freeShippingThreshold', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Standard Shipping (£)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.shipping.standardShippingCost}
                onChange={(e) => updateSettings('shipping.standardShippingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Express Shipping (£)</label>
              <Input
                type="number"
                step="0.01"
                value={settings.shipping.expeditedShippingCost}
                onChange={(e) => updateSettings('shipping.expeditedShippingCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Settings
          </CardTitle>
          <CardDescription>Configure payment methods and gateways</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Stripe Publishable Key</label>
            <Input
              type="password"
              value={settings.payments.stripePublishableKey}
              onChange={(e) => updateSettings('payments.stripePublishableKey', e.target.value)}
              placeholder="pk_live_..."
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">PayPal Payments</h4>
                <p className="text-sm text-gray-600">Accept payments via PayPal</p>
              </div>
              <Switch
                checked={settings.payments.paypalEnabled}
                onCheckedChange={(checked) => updateSettings('payments.paypalEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Bank Transfer</h4>
                <p className="text-sm text-gray-600">Accept bank transfer payments</p>
              </div>
              <Switch
                checked={settings.payments.bankTransferEnabled}
                onCheckedChange={(checked) => updateSettings('payments.bankTransferEnabled', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure email notifications and alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Order Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive emails for new orders</p>
            </div>
            <Switch
              checked={settings.notifications.orderEmails}
              onCheckedChange={(checked) => updateSettings('notifications.orderEmails', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Low Stock Alerts</h4>
              <p className="text-sm text-gray-600">Get notified when products are low in stock</p>
            </div>
            <Switch
              checked={settings.notifications.lowStockAlerts}
              onCheckedChange={(checked) => updateSettings('notifications.lowStockAlerts', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Customer Email Updates</h4>
              <p className="text-sm text-gray-600">Send order updates to customers</p>
            </div>
            <Switch
              checked={settings.notifications.customerEmails}
              onCheckedChange={(checked) => updateSettings('notifications.customerEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;