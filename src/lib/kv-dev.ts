import fs from 'fs';
import path from 'path';

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

const CONFIG_FILE = path.join(process.cwd(), '.dev-config.json');

export async function getConfig(): Promise<AppConfig | null> {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error getting config from file:', error);
    return null;
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving config to file:', error);
    throw new Error('Failed to save configuration');
  }
}