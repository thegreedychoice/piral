import * as lerna from './lerna';
import * as npm from './npm';
import * as pnp from './pnp';
import * as pnpm from './pnpm';
import * as rush from './rush';
import * as yarn from './yarn';

export const clients = {
  lerna,
  npm,
  pnp,
  pnpm,
  rush,
  yarn,
};

type ClientName = keyof typeof clients;

const directClients = ['npm', 'pnp', 'yarn', 'pnpm'];

export function isWrapperClient(client: ClientName) {
  return !directClients.includes(client);
}

export function detectClients(root: string) {
  return Promise.all(
    Object.keys(clients).map(async (client: ClientName) => {
      const result = await clients[client].detectClient(root);
      return {
        client,
        result,
      };
    }),
  );
}
