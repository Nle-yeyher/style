'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginUserAction } from '@/app/api/users/actions';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerUser, setCustomerUser] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCustomer = sessionStorage.getItem('customerUser');
    setCustomerUser(storedCustomer);
  }, []);

  const handleCustomerLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCustomerError(null);

    if (!customerEmail.trim() || !customerPassword.trim()) {
      setCustomerError('Completa email y contraseña para iniciar sesión.');
      return;
    }

    const emailLower = customerEmail.toLowerCase().trim();
    const isAdmin = emailLower === 'admin@stylesavvy.com' && customerPassword === 'admin123';

    if (isAdmin) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('adminUser', emailLower);
        sessionStorage.removeItem('customerUser');
        sessionStorage.removeItem('customerEmail');
      }
      router.push('/admin');
      return;
    }

    const result = await loginUserAction(emailLower, customerPassword);
    if (!result.success) {
      setCustomerError(result.error || 'No existe una cuenta con ese email. Regístrate primero.');
      return;
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('customerUser', result.user.name);
      sessionStorage.setItem('customerEmail', result.user.email);
      sessionStorage.setItem('userId', result.user.id);
      window.dispatchEvent(new Event('stylesavvy-auth-change'));
    }

    router.push(redirectTo);
  };

  const handleCustomerLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('customerUser');
      sessionStorage.removeItem('customerEmail');
      sessionStorage.removeItem('userId');
      window.dispatchEvent(new Event('stylesavvy-auth-change'));
    }
    setCustomerUser(null);
    setCustomerEmail('');
    setCustomerPassword('');
    setCustomerError(null);
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="mx-auto max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Ingresar datos</CardTitle>
            <p className="text-sm text-muted-foreground">Ingresa tu email y contraseña para continuar. Se verificará automáticamente si eres cliente o administrador.</p>
          </CardHeader>
          <CardContent>
            {customerUser ? (
              <div className="space-y-4">
                <p className="text-lg font-medium">Bienvenido, {customerUser}.</p>
                <Button type="button" onClick={() => router.push('/profile')}>Mi cuenta</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/')}>Seguir comprando</Button>
                <Button type="button" variant="outline" onClick={handleCustomerLogout}>Cerrar sesión</Button>
              </div>
            ) : (
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPassword">Contraseña</Label>
                  <Input
                    id="customerPassword"
                    type="password"
                    value={customerPassword}
                    onChange={(event) => setCustomerPassword(event.target.value)}
                    required
                  />
                </div>
                {customerError ? <p className="text-sm text-destructive">{customerError}</p> : null}
                <Button type="submit">Iniciar Sesión</Button>
                <p className="text-xs text-muted-foreground">
                  ¿No tienes cuenta? <a href="/register" className="text-primary underline">Regístrate aquí</a>.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
