import { describe, expect, it } from 'vitest';

import {
  CAMPUS_DEMO_PACKAGE,
  isCampusDemoMode,
} from '@/game/world/campusDemoPackage';
import { isCampusDemoBypassPath } from '@/lib/campusDemoAccess';

describe('campus demo package', () => {
  it('defines the stakeholder and developer campus demo routes', () => {
    expect(CAMPUS_DEMO_PACKAGE.publicDemoPath).toBe('/world/campus?demo=1');
    expect(CAMPUS_DEMO_PACKAGE.devSandboxPath).toBe('/dev/campus-sandbox');
    expect(CAMPUS_DEMO_PACKAGE.branch).toBe(
      'codex/simulated-students-campus-demo',
    );
  });

  it('packages a deterministic no-auth demo player', () => {
    expect(CAMPUS_DEMO_PACKAGE.demoPlayer).toEqual({
      name: 'Demo Explorer',
      level: 3,
      xp: 250,
      coins: 25,
      avatarId: 'player',
    });
  });

  it('documents a complete stakeholder walkthrough', () => {
    expect(CAMPUS_DEMO_PACKAGE.stakeholderWalkthrough).toHaveLength(5);
    expect(CAMPUS_DEMO_PACKAGE.stakeholderWalkthrough.join(' ')).toContain(
      'simulated students',
    );
  });

  it('detects campus demo mode from supported query values', () => {
    expect(isCampusDemoMode('?demo=1')).toBe(true);
    expect(isCampusDemoMode('demo=true')).toBe(true);
    expect(isCampusDemoMode(new URLSearchParams('demo=yes'))).toBe(true);
    expect(isCampusDemoMode('?demo=0')).toBe(false);
    expect(isCampusDemoMode('')).toBe(false);
  });

  it('limits middleware auth bypass to the stakeholder campus demo URL', () => {
    expect(isCampusDemoBypassPath('/world/campus', '?demo=1')).toBe(true);
    expect(isCampusDemoBypassPath('/world/campus', '?demo=true')).toBe(true);
    expect(isCampusDemoBypassPath('/world/campus', '?demo=0')).toBe(false);
    expect(isCampusDemoBypassPath('/world/campus', '')).toBe(false);
    expect(isCampusDemoBypassPath('/world', '?demo=1')).toBe(false);
    expect(isCampusDemoBypassPath('/world/create', '?demo=1')).toBe(false);
  });
});
