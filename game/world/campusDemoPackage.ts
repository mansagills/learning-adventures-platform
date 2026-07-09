export { isCampusDemoMode } from '@/lib/campusDemoAccess';

export interface CampusDemoPackage {
  title: string;
  publicDemoPath: string;
  devSandboxPath: string;
  branch: string;
  demoPlayer: {
    name: string;
    level: number;
    xp: number;
    coins: number;
    avatarId: string;
  };
  stakeholderWalkthrough: string[];
  verificationCommands: string[];
}

export const CAMPUS_DEMO_PACKAGE: CampusDemoPackage = {
  title: 'Simulated Students Campus Demo',
  publicDemoPath: '/world/campus?demo=1',
  devSandboxPath: '/dev/campus-sandbox',
  branch: 'codex/simulated-students-campus-demo',
  demoPlayer: {
    name: 'Demo Explorer',
    level: 3,
    xp: 250,
    coins: 25,
    avatarId: 'player',
  },
  stakeholderWalkthrough: [
    'Open the public demo URL and confirm the campus loads without signing in.',
    'Walk west to Math Hall and talk to Professor Numbers.',
    'Start Math Race Rally from the Math Hall station or guided quest flow.',
    'Finish or close the embedded activity and watch simulated students react.',
    'Point out ambient students, study circles, chat bubbles, and futuristic campus facades.',
  ],
  verificationCommands: [
    'npm.cmd test -- tests/world/campus-demo-package.test.ts tests/world/futuristic-campus-art.test.ts tests/world/sim-learners.test.ts tests/world/campus-guided-quest.test.ts tests/world/math-lab-quest.test.ts',
    'npx.cmd tsc --noEmit',
  ],
};
