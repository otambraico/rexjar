// apps/backend-api/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { generateToken, comparePassword, generateOtp } from '../services/authService';
import { authenticate } from '../middleware/authMiddleware';

export const authRouter = Router();

/**
 * POST /api/v1/auth/login
 * Login tradicional mediante correo y contraseña (Portal Auditor B2B y Colaboradores)
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email y contraseña son obligatorios' });
  }

  try {
    const userQuery = await pool.query(
      `SELECT u.id, u.company_id, u.email, u.full_name, u.role, u.password_hash, u.status,
              c.legal_name, c.tax_id
       FROM corp_expense.users u
       JOIN corp_expense.companies c ON u.company_id = c.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    const user = userQuery.rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'La cuenta se encuentra inactiva o suspendida' });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        success: false,
        error: 'Esta cuenta no tiene contraseña configurada. Utilice el acceso por código OTP / Enlace Mágico.'
      });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }

    // Actualizar última fecha de login
    await pool.query('UPDATE corp_expense.users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = generateToken({
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      company: {
        id: user.company_id,
        legalName: user.legal_name,
        taxId: user.tax_id
      }
    });
  } catch (error: any) {
    console.error('Error en /auth/login:', error);
    res.status(500).json({ success: false, error: 'Error interno en el servidor de autenticación' });
  }
});

/**
 * POST /api/v1/auth/magic-link/request
 * Solicita código OTP / enlace mágico de 6 dígitos para móvil sin contraseña
 */
authRouter.post('/magic-link/request', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'El correo electrónico es requerido' });
  }

  try {
    const userCheck = await pool.query(
      `SELECT u.id, u.email, u.full_name, c.legal_name 
       FROM corp_expense.users u
       JOIN corp_expense.companies c ON u.company_id = c.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    );

    if (userCheck.rows.length === 0) {
      // Respuesta deliberadamente genérica para no enumerar usuarios externos
      return res.json({
        success: true,
        message: 'Si el correo pertenece a una empresa registrada en REXJAR, recibirá su código OTP en breve.'
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      `UPDATE corp_expense.users 
       SET magic_token = $1, magic_token_expires_at = $2 
       WHERE id = $3`,
      [otp, expiresAt, userCheck.rows[0].id]
    );

    console.log(`📱 [OTP REXJAR MÓVIL] Enviado a ${email}: ${otp} (Expira: ${expiresAt.toISOString()})`);

    res.json({
      success: true,
      message: 'Código de verificación generado con éxito.',
      // En modo desarrollo / MVP se retorna devOtp para facilitar pruebas sin servicio SMTP
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error: any) {
    console.error('Error en /magic-link/request:', error);
    res.status(500).json({ success: false, error: 'Error al procesar la solicitud de código OTP' });
  }
});

/**
 * POST /api/v1/auth/magic-link/verify
 * Valida el código OTP de 6 dígitos y entrega el token JWT de sesión
 */
authRouter.post('/magic-link/verify', async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'Email y código OTP son requeridos' });
  }

  try {
    const query = await pool.query(
      `SELECT u.id, u.company_id, u.email, u.full_name, u.role, u.magic_token, u.magic_token_expires_at,
              c.legal_name, c.tax_id
       FROM corp_expense.users u
       JOIN corp_expense.companies c ON u.company_id = c.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Código inválido o expirado' });
    }

    const user = query.rows[0];

    if (!user.magic_token || user.magic_token !== code.trim()) {
      return res.status(401).json({ success: false, error: 'El código ingresado es incorrecto' });
    }

    if (new Date() > new Date(user.magic_token_expires_at)) {
      return res.status(401).json({ success: false, error: 'El código OTP ha expirado. Solicite uno nuevo.' });
    }

    // Limpiar el token de un solo uso y registrar login
    await pool.query(
      `UPDATE corp_expense.users 
       SET magic_token = NULL, magic_token_expires_at = NULL, last_login_at = NOW() 
       WHERE id = $1`,
      [user.id]
    );

    const token = generateToken({
      userId: user.id,
      companyId: user.company_id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      company: {
        id: user.company_id,
        legalName: user.legal_name,
        taxId: user.tax_id
      }
    });
  } catch (error: any) {
    console.error('Error en /magic-link/verify:', error);
    res.status(500).json({ success: false, error: 'Error al verificar el código OTP' });
  }
});

/**
 * GET /api/v1/auth/me
 * Retorna los datos del usuario autenticado en base al token JWT
 */
authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }

  try {
    const query = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.status, u.created_at,
              c.id as company_id, c.legal_name, c.tax_id
       FROM corp_expense.users u
       JOIN corp_expense.companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (query.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const row = query.rows[0];
    res.json({
      success: true,
      user: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        status: row.status,
        createdAt: row.created_at
      },
      company: {
        id: row.company_id,
        legalName: row.legal_name,
        taxId: row.tax_id
      }
    });
  } catch (error: any) {
    console.error('Error en /auth/me:', error);
    res.status(500).json({ success: false, error: 'Error al obtener datos del perfil' });
  }
});
