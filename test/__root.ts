import { join } from "path";

export const __ROOT = join(__dirname, '..');

export const isWin = process.platform === "win32";

export const __FIXTURES = join(__dirname, 'fixtures');
