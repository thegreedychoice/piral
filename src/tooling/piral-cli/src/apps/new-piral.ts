import { resolve, basename } from 'path';
import { frameworkKeys } from '../helpers';
import { LogLevels, Framework, NpmClientType } from '../types';
import {
  ForceOverwrite,
  SourceLanguage,
  installNpmPackage,
  updateExistingJson,
  getPiralPackage,
  scaffoldPiralSourceFiles,
  createDirectory,
  createFileIfNotExists,
  logDone,
  installNpmDependencies,
  combinePackageRef,
  setLogLevel,
  fail,
  progress,
  determineNpmClient,
  cliVersion,
  getPiralScaffoldData,
  config,
  initNpmProject,
} from '../common';

export interface NewPiralOptions {
  /**
   * The package registry to use for resolving the specified Piral app.
   */
  registry?: string;

  /**
   * Sets the path to the app's source HTML file.
   */
  app?: string;

  /**
   * Sets the framework/library to use.
   */
  framework?: Framework;

  /**
   * Sets the target directory where the generated files should be placed.
   */
  target?: string;

  /**
   * The initial version that will also be written into the package.json
   */
  version?: string;

  /**
   * Determines if files should be overwritten by the installation.
   */
  forceOverwrite?: ForceOverwrite;

  /**
   * Determines the programming language for the new Piral instance. (e.g. 'ts')
   */
  language?: SourceLanguage;

  /**
   * States if the npm dependecies should be installed when scaffolding.
   */
  install?: boolean;

  /**
   * Sets the boilerplate template to be used when scaffolding.
   */
  template?: string;

  /**
   * The log level that should be used within the scaffolding process.
   */
  logLevel?: LogLevels;

  /**
   * Sets the npm client to be used when scaffolding. (e.g. 'yarn')
   */
  npmClient?: NpmClientType;

  /**
   * Sets the default bundler to install. (e.g. 'parcel').
   */
  bundlerName?: string;

  /**
   * Places additional variables that should used when scaffolding.
   */
  variables?: Record<string, string>;
}

export const newPiralDefaults: NewPiralOptions = {
  app: './src/index.html',
  registry: config.registry,
  framework: 'piral',
  target: '.',
  version: cliVersion,
  forceOverwrite: ForceOverwrite.no,
  language: config.language,
  install: true,
  template: 'default',
  logLevel: LogLevels.info,
  npmClient: undefined,
  bundlerName: 'none',
  variables: {},
};

export async function newPiral(baseDir = process.cwd(), options: NewPiralOptions = {}) {
  const {
    app = newPiralDefaults.app,
    registry = newPiralDefaults.registry,
    framework = newPiralDefaults.framework,
    target = newPiralDefaults.target,
    version = newPiralDefaults.version,
    forceOverwrite = newPiralDefaults.forceOverwrite,
    language = newPiralDefaults.language,
    install = newPiralDefaults.install,
    template = newPiralDefaults.template,
    logLevel = newPiralDefaults.logLevel,
    bundlerName = newPiralDefaults.bundlerName,
    variables = newPiralDefaults.variables,
    npmClient: defaultNpmClient = newPiralDefaults.npmClient,
  } = options;
  const fullBase = resolve(process.cwd(), baseDir);
  const root = resolve(fullBase, target);

  if (!frameworkKeys.includes(framework)) {
    fail('generalError_0002', `The "framework" value must be one of: ${frameworkKeys.join(', ')}`);
  }

  setLogLevel(logLevel);
  progress('Preparing source and target ...');
  const success = await createDirectory(root);

  if (success) {
    const npmClient = await determineNpmClient(root, defaultNpmClient);
    const packageRef = combinePackageRef(framework, version, 'registry');
    const projectName = basename(root);

    progress(`Creating a new Piral instance in %s ...`, root);

    await createFileIfNotExists(
      root,
      'package.json',
      JSON.stringify(
        {
          name: projectName,
          version: '1.0.0',
          description: '',
          keywords: ['piral'],
          dependencies: {},
          scripts: {},
        },
        undefined,
        2,
      ),
    );

    await initNpmProject(npmClient, projectName, root);

    if (registry !== newPiralDefaults.registry) {
      progress(`Setting up npm registry (%s) ...`, registry);

      await createFileIfNotExists(
        root,
        '.npmrc',
        `registry=${registry}
always-auth=true`,
        forceOverwrite,
      );
    }

    progress(`Installing npm package ${packageRef} ...`);

    await installNpmPackage(npmClient, packageRef, root, '--save-exact');

    progress(`Taking care of templating ...`);

    await updateExistingJson(root, 'package.json', getPiralPackage(app, language, version, framework, bundlerName));

    await scaffoldPiralSourceFiles(
      template,
      registry,
      getPiralScaffoldData(language, root, app, framework, variables),
      forceOverwrite,
    );

    if (install) {
      progress(`Installing dependencies ...`);
      await installNpmDependencies(npmClient, root);
    }

    logDone(`Piral instance scaffolded successfully!`);
  } else {
    fail('cannotCreateDirectory_0044');
  }
}
