import { NextRequest, NextResponse } from 'next/server';
import { getConfig, saveConfig, AppConfig } from '@/lib/kv';
import { createWebhook, deleteWebhook, extractFileKey } from '@/lib/figma';

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AppConfig;
    
    if (!body.figmaFileUrl || !body.slackChannelId) {
      return NextResponse.json(
        { error: 'Figma file URL and Slack channel ID are required' },
        { status: 400 }
      );
    }

    let fileKey: string;
    try {
      fileKey = extractFileKey(body.figmaFileUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Figma file URL format' },
        { status: 400 }
      );
    }

    const currentConfig = await getConfig();
    
    if (currentConfig?.webhookId) {
      try {
        await deleteWebhook(currentConfig.webhookId);
      } catch (error) {
        console.warn('Failed to delete existing webhook:', error);
      }
    }

    // For local development, you'll need a public URL (like ngrok) for webhooks to work
    const webhookEndpoint = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/webhook`
      : `${process.env.WEBHOOK_URL || 'http://localhost:3001'}/api/webhook`;
    
    let webhookId: string = 'dev-webhook-id';
    
    // Skip webhook creation in development mode
    if (!process.env.DEV_MODE) {
      try {
        webhookId = await createWebhook(fileKey, webhookEndpoint);
      } catch (error: any) {
        if (error.message.includes('token')) {
          return NextResponse.json(
            { error: 'Could not create webhook. The Figma token in your Environment Variables may be invalid or lack permissions.' },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { error: 'Could not create webhook. Please check the Figma File URL; it may be incorrect or inaccessible.' },
            { status: 400 }
          );
        }
      }
    }

    const configToSave: AppConfig = {
      ...body,
      webhookId,
    };

    await saveConfig(configToSave);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}