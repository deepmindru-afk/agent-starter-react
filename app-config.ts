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

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Портал',
  pageTitle: 'Портал Агенты',
  pageDescription: 'Портал ИИ-агенты',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#b10ed6ff',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#c10ae6ff',
  startButtonText: 'Открыть Портал',

  // agent dispatch configuration
  agentName: process.env.AGENT_NAME ?? portal, //undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
  //agentName: 'portal',
  //agentName: undefined,
};
