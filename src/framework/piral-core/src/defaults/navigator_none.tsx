import { NavigationApi } from '../types';

const _noop = () => {};

export function useRouterContext() {
  return undefined;
}

export function useCurrentNavigation() {}

export function createRedirect() {
  return () => null;
}

export function createNavigation(): NavigationApi {
  return {
    get path() {
      return location.pathname;
    },
    get url() {
      const loc = location;
      return `${loc.pathname}${loc.search}${loc.hash}`;
    },
    push(target, state) {},
    replace(target, state) {},
    go(n) {},
    block(blocker) {
      return _noop;
    },
    listen(listener) {
      return _noop;
    },
    router: undefined,
  };
}
