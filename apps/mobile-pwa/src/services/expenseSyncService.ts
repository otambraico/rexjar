import { db, PendingExpense } from '../db/indexedDB';

const API_BASE_URL = 'http://localhost:4000/api/v1';

/**
 * Optimiza y redimensiona una imagen usando Web Worker con OffscreenCanvas.
 * Si el navegador o hardware no soporta Worker/OffscreenCanvas, hace fallback transparente.
 */
export async function optimizeImageWithWorker(file: File): Promise<Blob> {
  // Profiling de capacidades del dispositivo (Degradación Elegante)
  const deviceMemory = (navigator as any).deviceMemory || 4; // GB
  const maxDim = deviceMemory <= 2 ? 1280 : 1920; // 1280px para terminales gama baja (<2GB RAM)

  return new Promise((resolve) => {
    try {
      const worker = new Worker(new URL('../workers/imageWorker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (e) => {
        worker.terminate();
        if (e.data.success && e.data.blob) {
          resolve(e.data.blob);
        } else {
          resolve(file); // Fallback al archivo original
        }
      };

      worker.onerror = () => {
        worker.terminate();
        resolve(file); // Fallback en caso de error
      };

      worker.postMessage({ file, maxDim, quality: 0.82 });
    } catch {
      resolve(file); // Fallback si Workers no están soportados
    }
  });
}

/**
 * Guarda una rendición en la cola de IndexedDB para persistencia Offline-First
 */
export async function saveExpenseOffline(expense: Omit<PendingExpense, 'id' | 'status' | 'createdAt'>): Promise<number> {
  const id = await db.pendingExpenses.add({
    ...expense,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
  return Number(id);
}

/**
 * Obtiene el conteo actual de comprobantes pendientes de sincronizar en IndexedDB
 */
export async function getPendingExpensesCount(): Promise<number> {
  return await db.pendingExpenses.where('status').equals('PENDING').count();
}

/**
 * Sincroniza todos los comprobantes pendientes de IndexedDB con el Backend API
 */
export async function syncPendingExpenses(): Promise<{ synced: number; failed: number }> {
  const pending = await db.pendingExpenses.where('status').equals('PENDING').toArray();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await db.pendingExpenses.update(item.id!, { status: 'SYNCING' });

      const response = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Company-ID': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        },
        body: JSON.stringify({
          title: item.claimTitle,
          totalAmount: item.amount,
          category: item.category,
          extras: item.extras,
          distanceKm: 5.2,
          durationMin: 14.5
        })
      });

      if (response.ok) {
        await db.pendingExpenses.update(item.id!, { status: 'SYNCED' });
        synced++;
      } else {
        await db.pendingExpenses.update(item.id!, { status: 'ERROR' });
        failed++;
      }
    } catch {
      await db.pendingExpenses.update(item.id!, { status: 'PENDING' });
      failed++;
    }
  }

  return { synced, failed };
}

// Escuchador global de recuperación de red
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('📶 Red reestablecida: sincronizando rendiciones encoladas...');
    syncPendingExpenses();
  });
}
