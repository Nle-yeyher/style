
'use client';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    super(`Falta de permisos o insuficientes: ${context.operation} en ${context.path}`);
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
