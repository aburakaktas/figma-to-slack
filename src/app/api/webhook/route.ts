import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/kv';
import { sendSlackMessage, createFigmaNotificationMessage } from '@/lib/slack';
import { verifyFigmaSignature } from '@/lib/crypto';
import { FigmaWebhookEvent } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Figma-Signature');
    
    if (!signature) {
      console.error('Missing X-Figma-Signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const config = await getConfig();
    if (!config) {
      console.error('No configuration found');
      return NextResponse.json(
        { error: 'No configuration found' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.FIGMA_WEBHOOK_SECRET || '';
    if (!verifyFigmaSignature(body, signature, webhookSecret)) {
      console.error('Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event: FigmaWebhookEvent = JSON.parse(body);
    
    const shouldSendNotification = checkNotificationSettings(event.event_type, config);
    
    if (!shouldSendNotification) {
      console.log(`Notification disabled for event type: ${event.event_type}`);
      return NextResponse.json({ success: true, message: 'Notification disabled' });
    }

    const slackMessage = createFigmaNotificationMessage(
      event,
      config.slackChannelId,
      event.file_name
    );

    await sendSlackMessage(slackMessage);
    
    console.log(`Successfully sent notification for ${event.event_type} event`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function checkNotificationSettings(eventType: string, config: any): boolean {
  switch (eventType) {
    case 'LIBRARY_PUBLISH':
      return config.notifications?.libraryPublish ?? true;
    case 'FILE_VERSION_UPDATE':
      return config.notifications?.fileVersionUpdate ?? true;
    case 'FILE_COMMENT':
      return config.notifications?.newComment ?? true;
    case 'FILE_DELETE':
      return config.notifications?.fileDeletion ?? false;
    default:
      return false;
  }
}