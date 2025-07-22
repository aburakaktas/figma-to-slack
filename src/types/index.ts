export interface FigmaWebhookEvent {
  event_type: 'FILE_UPDATE' | 'FILE_VERSION_UPDATE' | 'FILE_COMMENT' | 'FILE_DELETE' | 'LIBRARY_PUBLISH';
  file_key: string;
  file_name: string;
  timestamp: string;
  webhook_id: string;
  passcode?: string;
  comment?: {
    id: string;
    message: string;
    user: {
      id: string;
      handle: string;
    };
  };
  version_id?: string;
  library_items?: Array<{
    key: string;
    name: string;
  }>;
}

export interface SlackMessage {
  channel: string;
  blocks: any[];
  text?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}