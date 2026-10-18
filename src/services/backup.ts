import { BackupData } from '../types';
import { storageService } from './storage';
import { downloadBlob } from '../utils/export';

const BACKUP_SCHEMA_VERSION = 1;

/**
 * Creates a complete JSON backup object of all user data
 */
export function generateBackup(): BackupData {
  return {
    version: BACKUP_SCHEMA_VERSION,
    appName: 'CampusPaisa',
    exportedAt: new Date().toISOString(),
    settings: storageService.getSettings(),
    categories: storageService.getCategories(),
    transactions: storageService.getTransactions(),
    budgets: storageService.getBudgets(),
    savingsGoals: storageService.getSavingsGoals(),
    contributions: storageService.getContributions(),
    bills: storageService.getBills(),
  };
}

/**
 * Initiates file download of the backup JSON file
 */
export function exportBackupToFile(): void {
  const data = generateBackup();
  const dateStr = new Date().toISOString().slice(0, 10);
  const jsonString = JSON.stringify(data, null, 2);
  downloadBlob(jsonString, `campuspaisa-backup-${dateStr}.json`, 'application/json');
}

export interface RestoreResult {
  success: boolean;
  message: string;
  data?: BackupData;
}

/**
 * Validates whether a parsed object conforms to the CampusPaisa Backup format
 */
export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<BackupData>;

  if (candidate.appName !== 'CampusPaisa') return false;
  if (typeof candidate.version !== 'number' || candidate.version > BACKUP_SCHEMA_VERSION) {
    return false;
  }
  if (!Array.isArray(candidate.transactions)) return false;
  if (!Array.isArray(candidate.categories)) return false;

  return true;
}

/**
 * Restores data from a parsed backup object into storage
 */
export function restoreBackup(backup: BackupData): void {
  storageService.saveSettings(backup.settings);
  storageService.saveCategories(backup.categories);
  storageService.saveTransactions(backup.transactions);
  storageService.saveBudgets(backup.budgets || []);
  storageService.saveSavingsGoals(backup.savingsGoals || []);
  storageService.saveContributions(backup.contributions || []);
  storageService.saveBills(backup.bills || []);
  storageService.setInitialized();
}
