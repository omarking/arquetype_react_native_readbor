import { mockUser, mockPassword } from '../src/data/seed';

describe('Auth Module', () => {
  describe('Mock User Data', () => {
    it('should have valid mock user', () => {
      expect(mockUser).toBeDefined();
      expect(mockUser.id).toBe(1);
      expect(mockUser.email).toBe('test@occ.com.mx');
      expect(mockUser.name).toBe('Usuario de Prueba');
    });

    it('should have valid mock password', () => {
      expect(mockPassword).toBe('Test1234');
    });
  });

  describe('Login Validation', () => {
    const validateCredentials = (email: string, password: string): boolean => {
      return email === mockUser.email && password === mockPassword;
    };

    it('should validate correct credentials', () => {
      const isValid = validateCredentials('test@occ.com.mx', 'Test1234');
      expect(isValid).toBe(true);
    });

    it('should reject incorrect email', () => {
      const isValid = validateCredentials('wrong@email.com', 'Test1234');
      expect(isValid).toBe(false);
    });

    it('should reject incorrect password', () => {
      const isValid = validateCredentials('test@occ.com.mx', 'wrongpassword');
      expect(isValid).toBe(false);
    });
  });
});
