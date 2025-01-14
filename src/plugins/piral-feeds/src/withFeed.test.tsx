import * as React from 'react';
import * as piralCore from 'piral-core';
import * as useFeed from './useFeed';
import { render } from '@testing-library/react';
import { withFeed } from './withFeed';

jest.mock('piral-core');

const StubLoader: React.FC<any> = () => <div role="loader" />;
StubLoader.displayName = 'StubLoader';

const StubErrorInfo: React.FC<any> = ({ type, error }) => <div role="error" data-error={error}>{type}</div>;
StubErrorInfo.displayName = 'StubErrorInfo';

const StubComponent: React.FC<{ data: any }> = ({ data }) => <div role="component">{JSON.stringify(data)}</div>;
StubComponent.displayName = 'StubComponent';

(piralCore as any).RegisteredLoadingIndicator = StubLoader;
(piralCore as any).RegisteredErrorInfo = StubErrorInfo;

describe('withFeed Module', () => {
  it('shows loading without invoking action if already loading', () => {
    const options: any = { id: 'bar' };
    (useFeed as any).useFeed = () => [false, undefined, undefined];
    const Component: any = withFeed(StubComponent, options);
    const node = render(<Component />);
    expect(node.getAllByRole('loader').length).toBe(1);
    expect(node.queryAllByRole('component').length).toBe(0);
  });

  it('shows the component if loaded', () => {
    const options: any = { id: 'foo' };
    (useFeed as any).useFeed = () => [true, [1, 2, 3], undefined];
    const Component: any = withFeed(StubComponent, options);
    const node = render(<Component />);
    expect(node.queryAllByRole('loader').length).toBe(0);
    expect(node.getByRole('component').textContent).toEqual(JSON.stringify([1, 2, 3]));
  });

  it('shows the error if the feed errored', () => {
    const options: any = { id: 'errored' };
    (useFeed as any).useFeed = () => [true, undefined, 'my-error'];
    const Component: any = withFeed(StubComponent, options);
    const node = render(<Component />);
    expect(node.queryAllByRole('loader').length).toBe(0);
    expect(node.queryAllByRole('component').length).toBe(0);
    expect(node.getAllByRole('error').length).toBe(1);
    expect(node.getByRole('error').textContent).toBe('feed');
    expect(node.getByRole('error').getAttribute("data-error")).toBe('my-error');
  });

  it('calls the load inside useEffect', () => {
    const options: any = { id: 'fresh' };
    (useFeed as any).useFeed = () => [false, undefined, undefined];
    const Component: any = withFeed(StubComponent, options);
    const node = render(<Component />);
    expect(node.getAllByRole('loader').length).toBe(1);
    expect(node.queryAllByRole('component').length).toBe(0);
    expect(node.queryAllByRole('error').length).toBe(0);
  });
});
