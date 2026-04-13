import { describe, expect, it, vi } from 'vitest';

vi.mock('vscode', () => ({
  MarkdownString: class MarkdownString {
    value = '';
    isTrusted: unknown;

    appendMarkdown(markdown: string): void {
      this.value += markdown;
    }

    appendText(text: string): void {
      this.value += text;
    }
  },
  ThemeColor: class ThemeColor {
    constructor(public readonly id: string) {}
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  window: {
    createStatusBarItem: vi.fn(),
  },
}));

import type { ExtensionConfig, UsageData } from '../core/models';
import { computeDisplayPct, renderStatusBarText } from '../ui/statusBar';

const baseData: UsageData = {
  used: 150,
  quota: 300,
  usedPct: 50,
  unlimited: false,
  noData: false,
  overageEnabled: false,
  overageUsed: 0,
  plan: 'Pro',
  resetDate: new Date(),
  chatQuota: null,
  completionsQuota: null,
  premiumQuota: null,
  chatEnabled: true,
  mcpEnabled: true,
  assignedDate: null,
  accessType: 'unknown',
};

const baseConfig: ExtensionConfig = {
  refreshIntervalMinutes: 5,
  thresholdEnabled: true,
  thresholdWarning: 75,
  thresholdCritical: 90,
  statusBarTextMode: 'percent',
  statusBarGraphicMode: 'none',
  statusBarTextPosition: 'left',
  segmentedBarWidth: 8,
};

describe('renderStatusBarText', () => {
  it('renders percent mode', () => {
    expect(renderStatusBarText(baseData, 50, baseConfig)).toBe('50%');
  });

  it('renders count mode', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'count' })).toBe('150/300');
  });

  it('renders countPercent mode', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'countPercent' })).toBe('150/300 (50%)');
  });

  it('renders remaining mode', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'remaining' })).toBe('150 left');
  });

  it('renders text-only (no graphic)', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'percent', statusBarGraphicMode: 'none' })).toBe('50%');
  });

  it('renders graphic-only (no text)', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'segmented' })).toBe('[■■■■□□□□]');
  });

  it('renders text left of graphic by default', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'percent', statusBarGraphicMode: 'segmented', statusBarTextPosition: 'left' })).toBe('50% [■■■■□□□□]');
  });

  it('renders text right of graphic when position is right', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'percent', statusBarGraphicMode: 'segmented', statusBarTextPosition: 'right' })).toBe('[■■■■□□□□] 50%');
  });

  it('renders all graphic styles', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'segmented' })).toBe('[■■■■□□□□]');
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'blocks' })).toBe('████░░░░');
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'thinBlocks' })).toBe('▰▰▰▰▱▱▱▱');
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'dots' })).toBe('••••····');
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'circles' })).toBe('●●●●○○○○');
  });

  it('respects segmentedBarWidth', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'segmented', segmentedBarWidth: 4 })).toBe('[■■□□]');
  });

  it('renders low percentages with at least one filled segment', () => {
    expect(renderStatusBarText(baseData, 1, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'segmented' })).toBe('[■□□□□□□□]');
  });

  it('falls back to percent when both text and graphic are none', () => {
    expect(renderStatusBarText(baseData, 50, { ...baseConfig, statusBarTextMode: 'none', statusBarGraphicMode: 'none' })).toBe('50%');
  });
});

describe('computeDisplayPct', () => {
  it('returns usedPct when no overage', () => {
    const data: UsageData = {
      used: 150,
      quota: 300,
      usedPct: 50,
      unlimited: false,
      noData: false,
      overageEnabled: false,
      overageUsed: 0,
      plan: 'Pro',
      resetDate: new Date(),
      chatQuota: null,
      completionsQuota: null,
      premiumQuota: null,
      chatEnabled: true,
      mcpEnabled: true,
      assignedDate: null,
      accessType: 'unknown',
    };
    expect(computeDisplayPct(data)).toBe(50);
  });

  it('returns >100% when overage is present', () => {
    const data: UsageData = {
      used: 300,
      quota: 300,
      usedPct: 100,
      unlimited: false,
      noData: false,
      overageEnabled: true,
      overageUsed: 33,
      plan: 'Pro',
      resetDate: new Date(),
      chatQuota: null,
      completionsQuota: null,
      premiumQuota: null,
      chatEnabled: true,
      mcpEnabled: true,
      assignedDate: null,
      accessType: 'unknown',
    };
    expect(computeDisplayPct(data)).toBe(111);
  });

  it('returns usedPct when overage enabled but 0 usage', () => {
    const data: UsageData = {
      used: 200,
      quota: 300,
      usedPct: 67,
      unlimited: false,
      noData: false,
      overageEnabled: true,
      overageUsed: 0,
      plan: 'Pro',
      resetDate: new Date(),
      chatQuota: null,
      completionsQuota: null,
      premiumQuota: null,
      chatEnabled: true,
      mcpEnabled: true,
      assignedDate: null,
      accessType: 'unknown',
    };
    expect(computeDisplayPct(data)).toBe(67);
  });
});