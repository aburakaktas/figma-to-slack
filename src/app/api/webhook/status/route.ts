import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/kv';
import { getWebhook } from '@/lib/figma';

export async function GET() {
  try {
    const config = await getConfig();
    
    if (!config?.webhookId) {
      return NextResponse.json({ active: false });
    }

    const webhook = await getWebhook(config.webhookId);
    
    return NextResponse.json({ 
      active: webhook !== null && webhook.status === 'ACTIVE'
    });
    
  } catch (error) {
    console.error('Error checking webhook status:', error);
    return NextResponse.json({ active: false });
  }
}