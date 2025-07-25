"use client";

import { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import {
  Gear,
  HardDrive,
  ArrowClockwise
} from "@phosphor-icons/react";
import { Checkbox } from "primereact/checkbox";

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "BroGlow Admin",
    siteDescription: "Admin portal for BroGlow skincare platform",
    contactEmail: "admin@broglow.com",
    supportEmail: "support@broglow.com"
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: "strong",
    maxLoginAttempts: 5
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newUserAlerts: true,
    systemAlerts: true,
    marketingEmails: false
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    backupFrequency: "daily"
  });

  const passwordPolicyOptions = [
    { label: "Weak", value: "weak" },
    { label: "Medium", value: "medium" },
    { label: "Strong", value: "strong" },
    { label: "Very Strong", value: "very_strong" }
  ];

  const sessionTimeoutOptions = [
    { label: "15 minutes", value: 15 },
    { label: "30 minutes", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "4 hours", value: 240 }
  ];

  const backupFrequencyOptions = [
    { label: "Hourly", value: "hourly" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" }
  ];

  const handleSave = () => {
    // In a real app, you would save these settings to your API
    console.log("Saving settings...");
  };

  const handleReset = () => {
    // Reset to default values
    console.log("Resetting settings...");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Gear size={24} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>

        <TabView>
          <TabPanel header="General">
            <Card>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <InputText
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        siteName: e.target.value
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <InputText
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        contactEmail: e.target.value
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <InputTextarea
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      siteDescription: e.target.value
                    })}
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Email
                  </label>
                  <InputText
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({
                      ...generalSettings,
                      supportEmail: e.target.value
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header="Security">
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Two-Factor Authentication
                    </label>
                    <p className="text-sm text-gray-500">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <Checkbox
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      twoFactorAuth: e.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout
                  </label>
                  <Dropdown
                    value={securitySettings.sessionTimeout}
                    options={sessionTimeoutOptions}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: e.value
                    })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Policy
                  </label>
                  <Dropdown
                    value={securitySettings.passwordPolicy}
                    options={passwordPolicyOptions}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      passwordPolicy: e.value
                    })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Login Attempts
                  </label>
                  <InputText
                    type="number"
                    value={securitySettings.maxLoginAttempts.toString()}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      maxLoginAttempts: Number(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header="Notifications">
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Send email notifications for system events
                    </p>
                  </div>
                  <Checkbox
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Push Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Send push notifications to admin devices
                    </p>
                  </div>
                  <Checkbox
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      pushNotifications: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New User Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Notify when new users register
                    </p>
                  </div>
                  <Checkbox
                    checked={notificationSettings.newUserAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      newUserAlerts: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Notify about system issues and updates
                    </p>
                  </div>
                  <Checkbox
                    checked={notificationSettings.systemAlerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      systemAlerts: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marketing Emails
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Checkbox
                    checked={notificationSettings.marketingEmails}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      marketingEmails: e.value
                    })}
                  />
                </div>
              </div>
            </Card>
          </TabPanel>

          <TabPanel header="System">
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance Mode
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable maintenance mode to restrict access
                    </p>
                  </div>
                  <Checkbox
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maintenanceMode: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Debug Mode
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable debug logging for development
                    </p>
                  </div>
                  <Checkbox
                    checked={systemSettings.debugMode}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      debugMode: e.value
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cache Enabled
                    </label>
                    <p className="text-sm text-gray-500">
                      Enable system caching for better performance
                    </p>
                  </div>
                  <Checkbox
                    checked={systemSettings.cacheEnabled}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      cacheEnabled: e.value
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency
                  </label>
                  <Dropdown
                    value={systemSettings.backupFrequency}
                    options={backupFrequencyOptions}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      backupFrequency: e.value
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </TabPanel>
        </TabView>

        <div className="flex gap-4 mt-6">
          <Button
            label="Save Settings"
            icon={<HardDrive size={16} />}
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          />
          <Button
            label="Reset to Defaults"
            icon={<ArrowClockwise size={16} />}
            onClick={handleReset}
            outlined
            severity="secondary"
          />
        </div>
      </div>
    </div>
  );
}
