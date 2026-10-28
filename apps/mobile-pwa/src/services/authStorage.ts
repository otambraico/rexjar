export interface CollaboratorSession {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  company: {
    id: string;
    legalName: string;
    taxId: string;
  };
}

const STORAGE_KEY = 'rexjar_collab_auth';

export function getStoredCollaboratorSession(): CollaboratorSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CollaboratorSession;
  } catch {
    return null;
  }
}

export function saveCollaboratorSession(session: CollaboratorSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearCollaboratorSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
