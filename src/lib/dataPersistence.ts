// Data persistence utility for NAZ TCG
// This handles backup and restore of admin data to prevent data loss

export interface BackupData {
  products: any[];
  orders: any[];
  customers: any[];
  timestamp: string;
  version: string;
}

export interface StorageKeys {
  PRODUCTS: 'adminProducts';
  ORDERS: 'adminOrders';
  CUSTOMERS: 'adminCustomers';
  BACKUP: 'naztcg_backup';
  LAST_BACKUP: 'naztcg_last_backup';
}

export const STORAGE_KEYS: StorageKeys = {
  PRODUCTS: 'adminProducts',
  ORDERS: 'adminOrders',
  CUSTOMERS: 'adminCustomers',
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
  createBackup(): BackupData {
    const backup: BackupData = {
      products: JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]'),
      orders: JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),
      customers: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]'),
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };

    // Store backup in localStorage
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, backup.timestamp);
    
    return backup;
  }

  // Restore data from backup
  restoreFromBackup(backupData: BackupData): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(backupData.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(backupData.orders));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(backupData.customers));
      
      // Trigger updates
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('customersUpdated'));
      
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  // Export data as downloadable JSON file
  exportData(): string {
    const backup = this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  // Import data from JSON string
  importData(jsonData: string): boolean {
    try {
      const backupData = JSON.parse(jsonData) as BackupData;
      return this.restoreFromBackup(backupData);
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Download backup as file
  downloadBackup(filename?: string): void {
    const backupData = this.exportData();
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
    const checkAndBackup = () => {
      const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
      const now = new Date().getTime();
      const lastBackupTime = lastBackup ? new Date(lastBackup).getTime() : 0;
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - lastBackupTime > twentyFourHours) {
        this.createBackup();
        console.log('Auto backup created');
      }
    };

    // Check on initialization
    checkAndBackup();
    
    // Check every hour
    setInterval(checkAndBackup, 60 * 60 * 1000);
  }

  // Sync data across browser tabs
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
  }

  // Initialize persistence system
  initialize(): void {
    this.syncAcrossTabs();
    this.startAutoBackup();
    
    // Create initial backup if none exists
    const { hasBackup } = this.getBackupInfo();
    if (!hasBackup) {
      this.createBackup();
    }
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
export const initializeDataPersistence = () => dataManager.initialize();