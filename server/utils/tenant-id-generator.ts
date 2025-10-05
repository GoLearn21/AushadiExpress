import { randomBytes } from 'crypto';

export function generateTenantId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(4).toString('hex');
  return `pharm_${timestamp}_${randomPart}`;
}

export function isValidTenantId(tenantId: string): boolean {
  return /^pharm_[a-z0-9]+_[a-f0-9]{8}$/.test(tenantId);
}
