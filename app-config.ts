import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Портал',
  pageTitle: 'Портал агенты',
  pageDescription: 'Персональные ИИ-ассистенты',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: 'https://raw.githubusercontent.com/sorokinvld/portal-brandpack/refs/heads/main/rings-1_Portal_Base.svg',
  accent: '#002cf2',
  logoDark: 'https://raw.githubusercontent.com/sorokinvld/portal-brandpack/refs/heads/main/rings-1_Portal_Base.svg',
  //'/lk-logo-dark.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Начать',
};
