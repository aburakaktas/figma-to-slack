import { SlackMessage } from '@/types';

export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  const slackToken = process.env.SLACK_BOT_TOKEN;
  if (!slackToken) {
    throw new Error('SLACK_BOT_TOKEN environment variable is not set');
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`);
  }
}

export function createTestMessage(channelId: string): SlackMessage {
  return {
    channel: channelId,
    text: 'Test message from Figma to Slack Connector',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🧪 *Test Message*\n\nYour Figma to Slack connector is working correctly!'
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: 'This is a test message to verify your Slack integration.'
          }
        ]
      }
    ]
  };
}

export function createFigmaNotificationMessage(
  event: any,
  channelId: string,
  fileName: string
): SlackMessage {
  const baseMessage = {
    channel: channelId,
  };

  switch (event.event_type) {
    case 'LIBRARY_PUBLISH':
      return {
        ...baseMessage,
        text: `Library published in ${fileName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📚 *Library Published*\n\n*File:* ${fileName}\n*Time:* ${new Date(event.timestamp).toLocaleString()}`
            }
          },
          ...(event.library_items ? [{
            type: 'section',
            fields: event.library_items.slice(0, 5).map((item: any) => ({
              type: 'mrkdwn',
              text: `• ${item.name}`
            }))
          }] : [])
        ]
      };

    case 'FILE_VERSION_UPDATE':
      return {
        ...baseMessage,
        text: `File version updated: ${fileName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🔄 *File Version Updated*\n\n*File:* ${fileName}\n*Time:* ${new Date(event.timestamp).toLocaleString()}`
            }
          }
        ]
      };

    case 'FILE_COMMENT':
      return {
        ...baseMessage,
        text: `New comment in ${fileName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `💬 *New Comment*\n\n*File:* ${fileName}\n*Author:* ${event.comment?.user?.handle || 'Unknown'}\n*Message:* ${event.comment?.message || 'No message'}\n*Time:* ${new Date(event.timestamp).toLocaleString()}`
            }
          }
        ]
      };

    case 'FILE_DELETE':
      return {
        ...baseMessage,
        text: `File deleted: ${fileName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🗑️ *File Deleted*\n\n*File:* ${fileName}\n*Time:* ${new Date(event.timestamp).toLocaleString()}`
            }
          }
        ]
      };

    default:
      return {
        ...baseMessage,
        text: `Figma event: ${event.event_type} in ${fileName}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📝 *Figma Update*\n\n*Event:* ${event.event_type}\n*File:* ${fileName}\n*Time:* ${new Date(event.timestamp).toLocaleString()}`
            }
          }
        ]
      };
  }
}