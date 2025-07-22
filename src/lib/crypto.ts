import { createHmac } from 'crypto';

export function verifyFigmaSignature(
  body: string, 
  signature: string, 
  secret: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
    
  return signature === expectedSignature;
}