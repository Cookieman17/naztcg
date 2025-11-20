import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cloudStorage } from "@/lib/cloudStorage";
import { 
  Cloud, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface StorageStatusProps {
  showDetailed?: boolean;
}

export function StorageStatusComponent({ showDetailed = false }: StorageStatusProps) {
  const [status, setStatus] = useState({ cloud: false, local: true, message: "" });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(cloudStorage.getStorageStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await cloudStorage.syncAllData();
      setStatus(cloudStorage.getStorageStatus());
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  if (!showDetailed) {
    // Compact version for headers
    return (
      <div className="flex items-center gap-2">
        {status.cloud ? (
          <>
            <Cloud className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Synced</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-600 font-medium">Local only</span>
          </>
        )}
      </div>
    );
  }

  // Detailed version for settings/dashboard
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Data Synchronization</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cloud Storage Status */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              {status.cloud ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-medium">Cloud Storage</div>
                <div className="text-sm text-gray-600">
                  {status.cloud 
                    ? "Connected - Data syncs across all devices" 
                    : "Not configured - Data saved locally only"}
                </div>
                {!status.cloud && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Setup required
                  </Badge>
                )}
              </div>
            </div>

            {/* Local Storage Status */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              {status.local ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-medium">Local Storage</div>
                <div className="text-sm text-gray-600">
                  {status.local 
                    ? "Available - Provides offline access" 
                    : "Not available - Browser storage disabled"}
                </div>
                {status.local && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Working
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium text-sm mb-1">Current Status</div>
            <div className="text-sm text-gray-600">{status.message}</div>
          </div>

          {/* Setup Instructions */}
          {!status.cloud && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-blue-900 mb-2">
                    Enable Cross-Device Sync
                  </div>
                  <div className="text-sm text-blue-700 mb-3">
                    Set up free cloud storage to sync products across all your devices. 
                    Products uploaded on laptop will appear on mobile and vice versa.
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      onClick={() => window.open('/CROSS_DEVICE_SYNC_SETUP.md', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Setup Guide
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                      onClick={() => window.open('https://supabase.com', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Get Supabase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {status.cloud && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-sm text-green-800">
                  <strong>Cross-device sync is active!</strong> Products uploaded on any device 
                  will automatically appear on all your other devices.
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StorageStatusComponent;