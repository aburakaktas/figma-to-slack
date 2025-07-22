interface FigmaWebhook {
  id: string;
  team_id: string;
  event_type: string;
  endpoint: string;
  passcode: string;
  status: string;
  client_id: string;
  description: string;
}

export async function createWebhook(fileKey: string, endpoint: string): Promise<string> {
  const figmaPat = process.env.FIGMA_PAT;
  if (!figmaPat) {
    throw new Error('FIGMA_PAT environment variable is not set');
  }

  const response = await fetch(`https://api.figma.com/v2/webhooks`, {
    method: 'POST',
    headers: {
      'X-Figma-Token': figmaPat,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'FILE_UPDATE',
      team_id: fileKey,
      endpoint,
      passcode: process.env.FIGMA_WEBHOOK_SECRET || generatePasscode(),
      description: 'Figma to Slack Connector Webhook',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create webhook: ${error}`);
  }

  const data = await response.json();
  return data.id;
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  const figmaPat = process.env.FIGMA_PAT;
  if (!figmaPat) {
    throw new Error('FIGMA_PAT environment variable is not set');
  }

  const response = await fetch(`https://api.figma.com/v2/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: {
      'X-Figma-Token': figmaPat,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete webhook: ${error}`);
  }
}

export async function getWebhook(webhookId: string): Promise<FigmaWebhook | null> {
  const figmaPat = process.env.FIGMA_PAT;
  if (!figmaPat) {
    throw new Error('FIGMA_PAT environment variable is not set');
  }

  try {
    const response = await fetch(`https://api.figma.com/v2/webhooks/${webhookId}`, {
      headers: {
        'X-Figma-Token': figmaPat,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

export function extractFileKey(figmaUrl: string): string {
  // Support both old /file/ and new /design/ URL formats
  const match = figmaUrl.match(/\/(file|design)\/([^\/\?]+)/);
  if (!match) {
    throw new Error('Invalid Figma file URL');
  }
  return match[2];
}

function generatePasscode(): string {
  return Math.random().toString(36).substring(2, 15);
}