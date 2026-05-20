'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { registerUserAction } from '@/app/api/users/actions';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Completa todos los campos.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      const result = await registerUserAction({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setError(result.error || 'Error al registrar');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('customerUser', result.user!.name);
        sessionStorage.setItem('customerEmail', result.user!.email);
        sessionStorage.setItem('userId', result.user!.id);
        window.dispatchEvent(new Event('stylesavvy-auth-change'));
      }

      router.push(redirectTo);
    } catch (err) {
      setError('Error al registrar usuario');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Registro de Cliente</CardTitle>
            <p className="text-sm text-muted-foreground">Crea tu cuenta para poder comprar en la tienda.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Repite la contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta? <a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary underline">Inicia sesión aquí</a>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
