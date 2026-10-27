// apps/backend-api/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthUserPayload } from '../services/authService';
import { pool } from '../config/db';

// Extender el tipado de Request para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Middleware que verifica el token JWT y activa el contexto RLS de PostgreSQL
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token Bearer faltante o inválido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;

    // Inyectar en PostgreSQL el tenant_id verificado para activar Row Level Security (RLS)
    if (pool && payload.companyId) {
      await pool.query("SELECT set_config('app.current_company_id', $1, false)", [payload.companyId]);
    }

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado. Por favor inicie sesión nuevamente.'
    });
  }
}

/**
 * Middleware para validar que el usuario posea uno de los roles autorizados (RBAC)
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado: El rol '${req.user.role}' no tiene permisos para esta acción`
      });
    }

    next();
  };
}

/**
 * Middleware opcional: si hay token lo decodifica, si no continúa como anónimo
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      req.user = payload;
      if (pool && payload.companyId) {
        await pool.query("SELECT set_config('app.current_company_id', $1, false)", [payload.companyId]);
      }
    } catch {
      // Token inválido en ruta opcional, se ignora
    }
  }
  next();
}
