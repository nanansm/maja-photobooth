import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import * as types from '../../../shared/types';

const Settings: React.FC = () => {
  const { config, updateConfig } = useStore();
  const [formData, setFormData] = useState<Partial<types.AppConfig>>(config);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await updateConfig(formData);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to save: ${error}` });
    }

    setSaving(false);
  };

  const handleTestPayment = async () => {
    try {
      // Test API connection
      const response = await fetch('https://api.xendit.co/invoices', {
        headers: {
          'Authorization': `Bearer ${formData.xenditSecretKey}`
        }
      });

      if (response.ok) {
        alert('✅ Xendit API connection successful!');
      } else {
        alert('❌ Xendit API connection failed. Check your API key.');
      }
    } catch (error) {
      alert('❌ Failed to connect to Xendit API');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h2 className="text-3xl font-display font-bold">Settings</h2>

      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-900/50 border border-green-700 text-green-200'
              : 'bg-red-900/50 border border-red-700 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl p-8 space-y-8">
        {/* Payment Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-primary-400">💳 Payment (Xendit)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Secret API Key</label>
              <input
                type="password"
                value={formData.xenditSecretKey}
                onChange={(e) => setFormData({ ...formData, xenditSecretKey: e.target.value })}
                placeholder="xnd_production_..."
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Callback Token</label>
              <input
                type="password"
                value={formData.xenditCallbackToken}
                onChange={(e) => setFormData({ ...formData, xenditCallbackToken: e.target.value })}
                placeholder="Your callback token from Xendit dashboard"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Webhook Port</label>
              <input
                type="number"
                value={formData.webhookPort}
                onChange={(e) => setFormData({ ...formData, webhookPort: parseInt(e.target.value) || 3847 })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white w-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure this port is available and forwarded in Xendit webhook settings.
              </p>
            </div>
            <button
              onClick={handleTestPayment}
              className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-xl font-semibold"
            >
              Test Connection
            </button>
          </div>
        </section>

        {/* Display Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-blue-400">🖥️ Display</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Theme Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.themeColor}
                  onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-gray-700 rounded-xl text-white"
                  placeholder="#0ea5e9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Idle Screen Text</label>
              <input
                type="text"
                value={formData.idleText}
                onChange={(e) => setFormData({ ...formData, idleText: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Logo Path</label>
              <input
                type="text"
                value={formData.logoPath}
                onChange={(e) => setFormData({ ...formData, logoPath: e.target.value })}
                placeholder="assets/logo.png"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
        </section>

        {/* Hardware Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-purple-400">🔧 Hardware</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Camera</label>
              <input
                type="text"
                value={formData.defaultCamera || ''}
                onChange={(e) => setFormData({ ...formData, defaultCamera: e.target.value })}
                placeholder="Auto-detect"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Default Printer</label>
              <input
                type="text"
                value={formData.defaultPrinter || ''}
                onChange={(e) => setFormData({ ...formData, defaultPrinter: e.target.value })}
                placeholder="System default printer"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
          </div>
        </section>

        {/* Admin Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-orange-400">🔐 Admin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Admin Password</label>
              <input
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="demoMode"
                checked={formData.demoMode}
                onChange={(e) => setFormData({ ...formData, demoMode: e.target.checked })}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="demoMode" className="text-sm">
                Enable Demo Mode (no real camera/printer/payment)
              </label>
            </div>
          </div>
        </section>

        {/* Email Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-green-400">📧 Email (SMTP)</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Provider</label>
                <select
                  value={formData.smtp?.provider || 'gmail'}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, provider: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook/Hotmail</option>
                  <option value="custom">Custom SMTP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Port</label>
                <input
                  type="number"
                  value={formData.smtp?.port || 587}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, port: parseInt(e.target.value) || 587 }
                  })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">SMTP Host</label>
              <input
                type="text"
                value={formData.smtp?.host || 'smtp.gmail.com'}
                onChange={(e) => setFormData({
                  ...formData,
                  smtp: { ...formData.smtp, host: e.target.value }
                })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username (Email)</label>
                <input
                  type="text"
                  value={formData.smtp?.auth?.user || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, auth: { ...formData.smtp?.auth, user: e.target.value } }
                  })}
                  placeholder="your-email@gmail.com"
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password / App Password</label>
                <input
                  type="password"
                  value={formData.smtp?.auth?.pass || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, auth: { ...formData.smtp?.auth, pass: e.target.value } }
                  })}
                  placeholder="For Gmail: use App Password"
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">From Name</label>
                <input
                  type="text"
                  value={formData.smtp?.fromName || 'Photobooth Kami'}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, fromName: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">From Email</label>
                <input
                  type="email"
                  value={formData.smtp?.fromEmail || 'noreply@photobooth.id'}
                  onChange={(e) => setFormData({
                    ...formData,
                    smtp: { ...formData.smtp, fromEmail: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
              <p className="text-blue-200 text-sm">
                <strong>Tip:</strong> For Gmail, enable 2FA and use App Password (16 chars) instead of your regular password.
              </p>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-yellow-400">🔔 Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifEnabled"
                checked={true}
                onChange={() => {}}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="notifEnabled" className="text-sm">
                Enable desktop notifications
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifSound"
                checked={true}
                onChange={() => {}}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="notifSound" className="text-sm">
                Play notification sounds
              </label>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold mb-3">Telegram Bot (Optional)</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                  <input
                    type="text"
                    value=""
                    onChange={() => {}}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Chat ID</label>
                  <input
                    type="text"
                    value=""
                    onChange={() => {}}
                    placeholder="Your Telegram chat ID"
                    className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Receive instant notifications to your Telegram when payment arrives or errors occur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Storage Settings */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-indigo-400">☁️ Cloud Storage</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Provider</label>
              <select
                value={formData.cloudStorage?.provider || 'none'}
                onChange={(e) => setFormData({
                  ...formData,
                  cloudStorage: { ...formData.cloudStorage, provider: e.target.value as any }
                })}
                className="w-full px-4 py-3 bg-gray-700 rounded-xl text-white"
              >
                <option value="none">None (Local Only)</option>
                <option value="cloudinary">Cloudinary</option>
                <option value="s3">AWS S3 / S3-compatible</option>
                <option value="google-drive">Google Drive</option>
              </select>
            </div>

            <div className="p-4 bg-gray-700/50 rounded-xl">
              <p className="text-gray-300 text-sm">
                If configured, photos will be uploaded to cloud and share links will be sent via email instead of attachments.
              </p>
            </div>

            {/* Provider-specific fields would appear here based on selection */}
            <p className="text-xs text-gray-500">
              Advanced cloud configuration requires API keys from your chosen provider.
            </p>
          </div>
        </section>

        {/* Save button */}
        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 rounded-xl font-bold text-lg transition-colors"
          >
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
