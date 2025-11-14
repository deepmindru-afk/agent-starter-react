export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  // for LiveKit Cloud Sandbox
  sandboxId?: string;
  agentName?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Портал',
  pageTitle: 'Портал Агенты',
  pageDescription: 'Персональные голосовые мультимодальные ИИ-агенты',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#8c02ba',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#ca1ff9',
  startButtonText: 'Начать',

  // for LiveKit Cloud Sandbox
  sandboxId: undefined,
  agentName: undefined,
};
