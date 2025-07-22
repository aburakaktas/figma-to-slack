import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/kv';
import { sendSlackMessage, createTestMessage } from '@/lib/slack';

export async function POST() {
  try {
    const config = await getConfig();
    
    if (!config?.slackChannelId) {
      return NextResponse.json(
        { error: 'No Slack channel configured' },
        { status: 400 }
      );
    }

    const testMessage = createTestMessage(config.slackChannelId);
    
    try {
      await sendSlackMessage(testMessage);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      if (error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Test message failed. Check the Slack token in Environment Variables and the Channel ID.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: `Test message failed: ${error.message}` },
          { status: 400 }
        );
      }
    }
    
  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}