'use client';

import { useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import { AppConfig } from '@/lib/kv';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function AdminDashboard() {
  const [config, setConfig] = useState<AppConfig>({
    figmaFileUrl: '',
    slackChannelId: '',
    notifications: {
      libraryPublish: true,
      fileVersionUpdate: true,
      newComment: true,
      fileDeletion: false,
    },
  });
  
  const [webhookStatus, setWebhookStatus] = useState<'loading' | 'active' | 'inactive'>('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    loadConfig();
    checkWebhookStatus();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const checkWebhookStatus = async () => {
    try {
      const response = await fetch('/api/webhook/status');
      const data = await response.json();
      setWebhookStatus(data.active ? 'active' : 'inactive');
    } catch (error) {
      console.error('Failed to check webhook status:', error);
      setWebhookStatus('inactive');
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('Configuration saved successfully!', 'success');
        await checkWebhookStatus();
      } else {
        showToast(data.error || 'Failed to save configuration', 'error');
      }
    } catch (error) {
      showToast('Failed to save configuration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (response.ok) {
        showToast('Test message sent successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to send test message', 'error');
      }
    } catch (error) {
      showToast('Failed to send test message', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const updateNotification = (key: keyof typeof config.notifications, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem', color: '#111827' }}>
        Figma to Slack Connector
      </h1>

      <div className="prereq-box">
        <div className="prereq-title">Prerequisites</div>
        <div className="prereq-text">
          Before using this tool, make sure you have set the following environment variables in your Vercel project settings:
          <br />
          • <strong>FIGMA_PAT</strong> - Your Figma Personal Access Token
          <br />
          • <strong>SLACK_BOT_TOKEN</strong> - Your Slack Bot Token (starts with xoxb-)
        </div>
      </div>

      <div className="card">
        <div className={`status-indicator ${webhookStatus === 'active' ? 'status-active' : 'status-inactive'}`}>
          Webhook Status: {webhookStatus === 'loading' ? 'Checking...' : webhookStatus === 'active' ? 'Active ✅' : 'Disabled ❌'}
        </div>

        <div className="form-group">
          <label className="form-label">Figma File URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://www.figma.com/file/..."
            value={config.figmaFileUrl}
            onChange={(e) => setConfig(prev => ({ ...prev, figmaFileUrl: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Slack Channel ID</label>
          <input
            type="text"
            className="form-input"
            placeholder="C024BE91L"
            value={config.slackChannelId}
            onChange={(e) => setConfig(prev => ({ ...prev, slackChannelId: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notification Settings</label>
          <div className="toggle-section">
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={config.notifications.libraryPublish}
                  onChange={(e) => updateNotification('libraryPublish', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span>Library Publish</span>
            </div>
            
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={config.notifications.fileVersionUpdate}
                  onChange={(e) => updateNotification('fileVersionUpdate', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span>File Version Update</span>
            </div>
            
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={config.notifications.newComment}
                  onChange={(e) => updateNotification('newComment', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span>New Comment</span>
            </div>
            
            <div className="toggle-group">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={config.notifications.fileDeletion}
                  onChange={(e) => updateNotification('fileDeletion', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
              <span>File Deletion (Stretch Goal)</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button
            className="button"
            onClick={saveConfiguration}
            disabled={isLoading || !config.figmaFileUrl || !config.slackChannelId}
          >
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </button>
          
          <button
            className="button button-secondary"
            onClick={sendTestMessage}
            disabled={isLoading || !config.slackChannelId}
          >
            {isLoading ? 'Sending...' : 'Send Test Message'}
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}