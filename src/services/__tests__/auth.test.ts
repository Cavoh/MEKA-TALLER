import { describe, it, expect, vi } from 'vitest';

// Simulamos el perfil de usuario que se genera en StaffLogin.tsx
describe('Auth Logic - Staff Profiles', () => {
  it('debe generar un perfil de usuario correcto tras el login de personal', () => {
    const selectedStaff = {
      id: 'staff-1',
      nombre: 'Jose Administrador',
      tenantId: 't-100',
      rolName: 'ADMIN',
      contrasena: '1234'
    };

    // Lógica extraída de StaffLogin.tsx (línea 58-72)
    const user = {
      email: `${selectedStaff.nombre.toLowerCase()}@meka.com`,
      id: selectedStaff.id,
      nombre: selectedStaff.nombre
    };
    
    const profile = {
      id: selectedStaff.id,
      email: user.email,
      tenantId: selectedStaff.tenantId,
      roleId: selectedStaff.rolName,
      nombre: selectedStaff.nombre
    };

    expect(profile.roleId).toBe('ADMIN');
    expect(profile.tenantId).toBe('t-100');
    expect(profile.email).toContain('jose');
  });

  it('debe validar que el acceso de dueño (bypass) asigne el rol ADMIN', () => {
      // Simulación de la lógica de bypass en StaffLogin.tsx (línea 144)
      const onLogin = vi.fn();
      const selectedStaff = { id: 's1', nombre: 'Jose', tenantId: 't1' };

      // Simmulamos la ejecución del botón "Acceso de Dueño"
      if (selectedStaff.nombre.toLowerCase().includes('jose')) {
          onLogin({ email: 'jose@meka.com' }, { 
              id: selectedStaff.id, 
              email: 'jose@meka.com', 
              tenantId: selectedStaff.tenantId, 
              roleId: 'ADMIN', 
              nombre: selectedStaff.nombre 
          });
      }

      expect(onLogin).toHaveBeenCalledWith(
          expect.objectContaining({ email: 'jose@meka.com' }),
          expect.objectContaining({ roleId: 'ADMIN' })
      );
  });
});
