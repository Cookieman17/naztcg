import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  dataManager, 
  downloadBackup, 
  importData, 
  getBackupInfo, 
  createBackup 
} from "@/lib/dataPersistence";

const AdminDataManagement = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupInfo, setBackupInfo] = useState(getBackupInfo());
  const [isWorking, setIsWorking] = useState(false);

  const handleCreateBackup = async () => {
    setIsWorking(true);
    try {
      createBackup();
      setBackupInfo(getBackupInfo());
      toast({
        title: "Backup Created",
        description: "Your data has been backed up successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWorking(false);
    }
  };

  const handleDownloadBackup = () => {
    try {
      downloadBackup();
      toast({
        title: "Download Started",
        description: "Your backup file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download backup file.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importData(content)) {
          setBackupInfo(getBackupInfo());
          toast({
            title: "Data Imported",
            description: "Your data has been restored successfully.",
          });
        } else {
          toast({
            title: "Import Failed",
            description: "Failed to import data. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDataStats = () => {
    const products = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    const customers = JSON.parse(localStorage.getItem('adminCustomers') || '[]');
    const discountCodes = JSON.parse(localStorage.getItem('adminDiscountCodes') || '[]');
    
    return {
      products: products.length,
      orders: orders.length,
      customers: customers.length,
      discountCodes: discountCodes.length,
      totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">
            Backup, restore, and manage your store data
          </p>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Products</p>
              <p className="text-2xl font-bold">{stats.products}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm font-medium">Orders</p>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Customers</p>
              <p className="text-2xl font-bold">{stats.customers}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Discount Codes</p>
              <p className="text-2xl font-bold">{stats.discountCodes}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Backup Status */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-semibold">Backup Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Backup</span>
            </div>
            <p className="text-lg">{formatDate(backupInfo.lastBackup)}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Backup Available</span>
            </div>
            <div className="flex items-center gap-2">
              {backupInfo.hasBackup ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Yes</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">No</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create & Download Backup */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Backup Data</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Create and download a backup of all your store data including products, orders, and customers.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCreateBackup}
              disabled={isWorking}
              className="w-full"
              variant="outline"
            >
              {isWorking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Backup
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleDownloadBackup}
              disabled={!backupInfo.hasBackup}
              className="w-full"
              variant="default"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Backup File
            </Button>
          </div>
        </Card>

        {/* Import/Restore Data */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Restore Data</h2>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Upload and restore data from a backup file. This will replace all current data.
          </p>
          
          <div className="space-y-3">
            <Label htmlFor="backup-file">Select Backup File</Label>
            <Input
              id="backup-file"
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Restoring data will replace all current products, orders, and customers. 
                Make sure to create a backup first if you want to preserve current data.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>

      {/* Auto Backup Info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Automatic Backup</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">Daily Backups</p>
                <p className="text-sm text-green-600">Automatic backups every 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-800">Data Sync</p>
                <p className="text-sm text-blue-600">Synchronized across browser tabs</p>
              </div>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your data is automatically backed up locally every 24 hours. For additional security, 
              regularly download backup files and store them safely offline.
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  );
};

export default AdminDataManagement;