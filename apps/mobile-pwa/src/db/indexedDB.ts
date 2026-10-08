import Dexie, { Table } from 'dexie';

export interface PendingExpense {
  id?: number;
  claimTitle: string;
  category: string;
  amount: number;
  extras: {
    peaje: number;
    espera: number;
    estacionamiento: number;
  };
  imageBlob?: Blob;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'ERROR';
  createdAt: string;
}

export class RexjarOfflineDatabase extends Dexie {
  pendingExpenses!: Table<PendingExpense>;

  constructor() {
    super('RexjarOfflineDB');
    this.version(1).stores({
      pendingExpenses: '++id, category, status, createdAt'
    });
  }
}

export const db = new RexjarOfflineDatabase();
