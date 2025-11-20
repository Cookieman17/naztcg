// Data persistence utility for NAZ TCG
// This handles backup and restore of admin data to prevent data loss
// Now includes cloud storage support for cross-device synchronization

import { cloudStorage, migrateLocalDataToCloud } from './cloudStorage';

export interface BackupData {
  products: any[];
  orders: any[];
  customers: any[];
  discountCodes: any[];
  timestamp: string;
  version: string;
}

export interface StorageKeys {
  PRODUCTS: 'adminProducts';
  ORDERS: 'adminOrders';
  CUSTOMERS: 'adminCustomers';
  DISCOUNT_CODES: 'adminDiscountCodes';
  BACKUP: 'naztcg_backup';
  LAST_BACKUP: 'naztcg_last_backup';
}

export const STORAGE_KEYS: StorageKeys = {
  PRODUCTS: 'adminProducts',
  ORDERS: 'adminOrders',
  CUSTOMERS: 'adminCustomers',
  DISCOUNT_CODES: 'adminDiscountCodes',
  BACKUP: 'naztcg_backup',
  LAST_BACKUP: 'naztcg_last_backup'
};

class DataPersistenceManager {
  private static instance: DataPersistenceManager;
  
  static getInstance(): DataPersistenceManager {
    if (!DataPersistenceManager.instance) {
      DataPersistenceManager.instance = new DataPersistenceManager();
    }
    return DataPersistenceManager.instance;
  }

  // Create a backup of all admin data
  async createBackup(): Promise<BackupData> {
    const backup: BackupData = {
      products: await cloudStorage.loadProducts(),
      orders: await cloudStorage.loadOrders(),
      customers: await cloudStorage.loadCustomers(),
      discountCodes: await cloudStorage.loadDiscountCodes(),
      timestamp: new Date().toISOString(),
      version: '2.0.0' // Updated version for cloud support
    };

    // Store backup in localStorage for offline access
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, backup.timestamp);
    
    return backup;
  }

  // Restore data from backup
  async restoreFromBackup(backupData: BackupData): Promise<boolean> {
    try {
      // Save to both cloud and localStorage
      await Promise.all([
        cloudStorage.saveProducts(backupData.products),
        cloudStorage.saveOrders(backupData.orders),
        cloudStorage.saveCustomers(backupData.customers),
        cloudStorage.saveDiscountCodes(backupData.discountCodes || [])
      ]);

      // Also update localStorage for immediate access
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(backupData.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(backupData.orders));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(backupData.customers));
      localStorage.setItem(STORAGE_KEYS.DISCOUNT_CODES, JSON.stringify(backupData.discountCodes || []));
      
      // Trigger updates
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('customersUpdated'));
      window.dispatchEvent(new CustomEvent('discountCodesUpdated'));
      
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  // Export data as downloadable JSON file
  async exportData(): Promise<string> {
    const backup = await this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  // Import data from JSON string
  async importData(jsonData: string): Promise<boolean> {
    try {
      const backupData = JSON.parse(jsonData) as BackupData;
      return await this.restoreFromBackup(backupData);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Download backup as file
  async downloadBackup(filename?: string): Promise<void> {
    const backupData = await this.exportData();
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `naztcg-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Get backup info
  getBackupInfo(): { lastBackup: string | null; hasBackup: boolean } {
    const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
    const hasBackup = localStorage.getItem(STORAGE_KEYS.BACKUP) !== null;
    
    return { lastBackup, hasBackup };
  }

  // Auto backup every 24 hours
  startAutoBackup(): void {
    const checkAndBackup = async () => {
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      const now = new Date().getTime();
      const lastBackupTime = lastBackup ? new Date(lastBackup).getTime() : 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - lastBackupTime > twentyFourHours) {
        await this.createBackup();
        console.log('Auto backup created');
      }
    };

    // Check on initialization
    checkAndBackup();
    
    // Check every hour
    setInterval(checkAndBackup, 60 * 60 * 1000);
  }

  // Sync data across browser tabs and devices
  syncAcrossTabs(): void {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && [STORAGE_KEYS.PRODUCTS, STORAGE_KEYS.ORDERS, STORAGE_KEYS.CUSTOMERS].includes(event.key as any)) {
        // Dispatch appropriate update event
        if (event.key === STORAGE_KEYS.PRODUCTS) {
          window.dispatchEvent(new CustomEvent('productsUpdated'));
        } else if (event.key === STORAGE_KEYS.ORDERS) {
          window.dispatchEvent(new CustomEvent('ordersUpdated'));
        } else if (event.key === STORAGE_KEYS.CUSTOMERS) {
          window.dispatchEvent(new CustomEvent('customersUpdated'));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Sync data from cloud periodically (every 30 seconds)
    setInterval(async () => {
      try {
        await cloudStorage.syncAllData();
      } catch (error) {
        console.error('Error during periodic sync:', error);
      }
    }, 30000);
  }

  // Initialize persistence system
  async initialize(): Promise<void> {
    this.syncAcrossTabs();
    this.startAutoBackup();
    
    // Migrate existing localStorage data to cloud if needed
    try {
      await migrateLocalDataToCloud();
    } catch (error) {
      console.error('Error during migration:', error);
    }

    // Sync latest data from cloud
    try {
      await cloudStorage.syncAllData();
    } catch (error) {
      console.error('Error during initial sync:', error);
    }
    
    // Create initial backup if none exists
    const { hasBackup } = this.getBackupInfo();
    if (!hasBackup) {
      await this.createBackup();
    }
  }

  // Get storage status info
  getStorageStatus() {
    return cloudStorage.getStorageStatus();
  }
}

// Export singleton instance
export const dataManager = DataPersistenceManager.getInstance();

// Utility functions for easy access
export const createBackup = () => dataManager.createBackup();
export const downloadBackup = (filename?: string) => dataManager.downloadBackup(filename);
export const importData = (jsonData: string) => dataManager.importData(jsonData);
export const exportData = () => dataManager.exportData();
export const getBackupInfo = () => dataManager.getBackupInfo();
export const getStorageStatus = () => dataManager.getStorageStatus();
export const initializeDataPersistence = () => dataManager.initialize();