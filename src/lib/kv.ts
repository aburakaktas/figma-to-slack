// Use local file storage for development, Vercel KV for production
const isDev = process.env.NODE_ENV === 'development' && 
             !process.env.KV_REST_API_URL && 
             !process.env.KV_REST_API_TOKEN;

export interface AppConfig {
  figmaFileUrl: string;
  slackChannelId: string;
  webhookId?: string;
  notifications: {
    libraryPublish: boolean;
    fileVersionUpdate: boolean;
    newComment: boolean;
    fileDeletion: boolean;
  };
}

export async function getConfig(): Promise<AppConfig | null> {
  if (isDev) {
    const { getConfig: getDevConfig } = await import('./kv-dev');
    return getDevConfig();
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    const config = await kv.get<AppConfig>('figma-slack-config');
    return config;
  } catch (error) {
    console.error('Error getting config from KV:', error);
    return null;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  if (isDev) {
    const { saveConfig: saveDevConfig } = await import('./kv-dev');
    return saveDevConfig(config);
  }
  
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set('figma-slack-config', config);
  } catch (error) {
    console.error('Error saving config to KV:', error);
    throw new Error('Failed to save configuration');
  }
}