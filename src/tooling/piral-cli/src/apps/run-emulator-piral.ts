import { tmpdir } from 'os';
import { mkdtemp } from 'fs';
import { dirname, join, resolve } from 'path';
import { readKrasConfig, krasrc, buildKrasWithCli } from 'kras';
import { LogLevels, NpmClientType } from '../types';
import {
  config,
  openBrowser,
  notifyServerOnline,
  setLogLevel,
  progress,
  log,
  createInitialKrasConfig,
  getAvailablePort,
  installPiralInstance,
  createFileIfNotExists,
  ForceOverwrite,
  findPiralInstance,
  determineNpmClient,
} from '../common';

export interface RunEmulatorPiralOptions {
  /**
   * Sets the log level to use (1-5).
   */
  logLevel?: LogLevels;

  /**
   * The name of the app shell emulator to use.
   */
  app?: string;

  /**
   * Sets if the (system default) browser should be auto-opened.
   */
  open?: boolean;

  /**
   * Sets the port to use for the debug server.
   */
  port?: number;

  /**
   * The URL of a pilet feed(s) used to include locally missing pilets.
   */
  feed?: string | Array<string>;

  /**
   * The npm client to be used when scaffolding.
   * @example 'yarn'
   */
  npmClient?: NpmClientType;

  /**
   * The package registry to use for resolving the specified Piral app.
   */
  registry?: string;
}

export const runEmulatorPiralDefaults: RunEmulatorPiralOptions = {
  logLevel: LogLevels.info,
  open: config.openBrowser,
  port: config.port,
  registry: config.registry,
  npmClient: undefined,
};

function createTempDir() {
  const root = join(tmpdir(), 'piral-cli-');

  return new Promise<string>((resolve, reject) =>
    mkdtemp(root, (err, dir) => {
      if (err) {
        reject(err);
      } else {
        resolve(dir);
      }
    }),
  );
}

export async function runEmulatorPiral(baseDir = process.cwd(), options: RunEmulatorPiralOptions = {}) {
  const {
    open = runEmulatorPiralDefaults.open,
    port: originalPort = runEmulatorPiralDefaults.port,
    logLevel = runEmulatorPiralDefaults.logLevel,
    npmClient: defaultNpmClient = runEmulatorPiralDefaults.npmClient,
    registry = runEmulatorPiralDefaults.registry,
    app,
    feed,
  } = options;
  const publicUrl = '/';
  const api = config.piletApi;
  const fullBase = resolve(process.cwd(), baseDir);
  const baseMocks = resolve(fullBase, 'mocks');
  setLogLevel(logLevel);

  progress('Reading configuration ...');

  process.stderr?.setMaxListeners(16);
  process.stdout?.setMaxListeners(16);
  process.stdin?.setMaxListeners(16);

  const appRoot = await createTempDir();

  if (registry !== runEmulatorPiralDefaults.registry) {
    progress(`Setting up npm registry (%s) ...`, registry);

    await createFileIfNotExists(
      appRoot,
      '.npmrc',
      `registry=${registry}
always-auth=true`,
      ForceOverwrite.yes,
    );
  }

  const npmClient = await determineNpmClient(appRoot, defaultNpmClient);
  const [packageName] = await installPiralInstance(app, fullBase, appRoot, npmClient);
  const piral = await findPiralInstance(packageName, appRoot, originalPort);
  const port = await getAvailablePort(piral.port);

  const krasBaseConfig = resolve(fullBase, krasrc);
  const krasRootConfig = resolve(appRoot, krasrc);
  const initial = createInitialKrasConfig(baseMocks, [], { [api]: '' }, feed);
  const required = {
    injectors: {
      piral: {
        active: false,
      },
      pilet: {
        active: true,
        pilets: [],
        app: dirname(piral.app),
        publicUrl,
        handle: [publicUrl, api],
        api,
      },
    },
  };
  const configs = [krasBaseConfig, krasRootConfig];
  const krasConfig = readKrasConfig({ port, initial, required }, ...configs);

  log('generalVerbose_0004', `Using kras with configuration: ${JSON.stringify(krasConfig, undefined, 2)}`);

  const krasServer = buildKrasWithCli(krasConfig);
  krasServer.setMaxListeners(16);
  krasServer.removeAllListeners('open');
  krasServer.on('open', notifyServerOnline(publicUrl, krasConfig.api));

  await krasServer.start();
  openBrowser(open, port, publicUrl, !!krasConfig.ssl);
  await new Promise((resolve) => krasServer.on('close', resolve));
}
