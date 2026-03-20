
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/admin');
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Panel Administrativo</CardTitle>
          <CardDescription>
            Acceso exclusivo para empleados de STYLESAVVY. Por favor, inicia sesión para gestionar el inventario.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Button 
            onClick={handleLogin} 
            className="w-full py-6 text-lg gap-3"
            variant="default"
          >
            <LogIn className="h-5 w-5" />
            Continuar con Google
          </Button>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Al acceder, aceptas los términos de seguridad y confidencialidad de la empresa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
