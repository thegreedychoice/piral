import { ForceOverwrite, SourceLanguage } from './common/enums';
import { bundlerNames, frameworkLibs } from './common/constants';
import type {
  Framework,
  NpmClientType,
  PiletSchemaVersion,
  PiletPublishSource,
  PiralBuildType,
  PiletBuildType,
  PiletPublishScheme,
} from './types';

export const schemaKeys: Array<PiletSchemaVersion> = ['v0', 'v1', 'v2', 'none'];
export const publishModeKeys: Array<PiletPublishScheme> = ['none', 'basic', 'bearer', 'digest'];
export const fromKeys: Array<PiletPublishSource> = ['local', 'remote', 'npm'];
export const piralBuildTypeKeys: Array<PiralBuildType> = ['all', 'release', 'emulator', 'emulator-sources'];
export const piletBuildTypeKeys: Array<PiletBuildType> = ['default', 'standalone', 'manifest'];
export const clientTypeKeys: Array<NpmClientType> = ['npm', 'pnpm', 'pnp', 'yarn', 'lerna', 'rush'];
export const bundlerKeys: Array<string> = ['none', ...bundlerNames];
export const availableBundlers: Array<string> = [];
export const availableReleaseProviders: Array<string> = [];
export const frameworkKeys: Array<Framework> = [...frameworkLibs];
export const forceOverwriteKeys = Object.keys(ForceOverwrite).filter((m) => typeof ForceOverwrite[m] === 'number');

export function valueOfForceOverwrite(key: string): ForceOverwrite {
  for (const forceOverwriteKey of forceOverwriteKeys) {
    if (forceOverwriteKey === key) {
      return ForceOverwrite[forceOverwriteKey];
    }
  }

  return ForceOverwrite.no;
}

export function keyOfForceOverwrite(value: ForceOverwrite) {
  for (const forceOverwriteKey of forceOverwriteKeys) {
    if (ForceOverwrite[forceOverwriteKey] === value) {
      return forceOverwriteKey;
    }
  }

  return forceOverwriteKeys[0];
}

export const sourceLanguageKeys = Object.keys(SourceLanguage).filter((m) => typeof SourceLanguage[m] === 'number');

export function valueOfSourceLanguage(key: string): SourceLanguage {
  for (const piletLanguageKey of sourceLanguageKeys) {
    if (piletLanguageKey === key) {
      return SourceLanguage[piletLanguageKey];
    }
  }

  return SourceLanguage.ts;
}

export function keyOfSourceLanguage(value: SourceLanguage) {
  for (const piletLanguageKey of sourceLanguageKeys) {
    if (SourceLanguage[piletLanguageKey] === value) {
      return piletLanguageKey;
    }
  }

  return sourceLanguageKeys[0];
}
