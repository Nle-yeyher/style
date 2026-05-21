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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customerUser, setCustomerUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCustomer = sessionStorage.getItem('customerUser');
    setCustomerUser(storedCustomer);
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña.');
      setIsLoading(false);
      return;
    }

    const result = await loginUserAction(email.toLowerCase().trim(), password);

    if (!result.success) {
      setError(result.error ?? 'Credenciales incorrectas.');
      setIsLoading(false);
      return;
    }

    if (!result.user) {
      setError('Credenciales incorrectas.');
      setIsLoading(false);
      return;
    }

    const user = result.user;

    // Redirigir según el rol
    if (user.role === 'admin') {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('adminUser', user.email);
        sessionStorage.removeItem('customerUser');
        sessionStorage.removeItem('customerEmail');
        sessionStorage.removeItem('userId');
      }
      router.push('/admin');
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('customerUser', user.name);
        sessionStorage.setItem('customerEmail', user.email);
        sessionStorage.setItem('userId', String(user.id));
        window.dispatchEvent(new Event('stylesavvy-auth-change'));
      }
      router.push(redirectTo);
    }

    setIsLoading(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('customerUser');
      sessionStorage.removeItem('customerEmail');
      sessionStorage.removeItem('userId');
      window.dispatchEvent(new Event('stylesavvy-auth-change'));
    }
    setCustomerUser(null);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="mx-auto max-w-md">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ingresa tu email y contraseña. El sistema detectará automáticamente si eres cliente o administrador.
            </p>
          </CardHeader>
          <CardContent>
            {customerUser ? (
              <div className="space-y-4">
                <p className="text-lg font-medium">Bienvenido, {customerUser}.</p>
                <Button type="button" onClick={() => router.push('/profile')}>Mi cuenta</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/')}>Seguir comprando</Button>
                <Button type="button" variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  ¿No tienes cuenta?{' '}
                  <a href="/register" className="text-primary underline">Regístrate aquí</a>.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
