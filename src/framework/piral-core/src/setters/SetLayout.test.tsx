import * as React from 'react';
import create from 'zustand';
import { render } from '@testing-library/react';
import { SetLayout } from './SetLayout';
import { StateContext } from '../state/stateContext';

const FakeContainer = () => null;
FakeContainer.displayName = 'FakeContainer';

function createMockContainer() {
  const state = create(() => ({
    components: {},
  }));
  return {
    context: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      state,
      setComponent(name, comp) {
        const s = state.getState();
        state.setState({
          ...s,
          components: {
            ...s.components,
            [name]: comp,
          },
        });
      },
    } as any,
  };
}

describe('Piral SetLayout component', () => {
  it('SetLayout sets the layout components', () => {
    const { context } = createMockContainer();
    render(
      <StateContext.Provider value={context}>
        <SetLayout
          layout={
            {
              DashboardContainer: FakeContainer,
            } as any
          }
        />
      </StateContext.Provider>,
    );
    expect(context.state.getState().components).toEqual({
      DashboardContainer: FakeContainer,
    });
  });
});
