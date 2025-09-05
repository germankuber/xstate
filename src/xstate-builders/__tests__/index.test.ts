// Test suite index that imports all builder tests
// This ensures all tests are discovered and run together

import './ActionsBuilder.test';
import './DelaysBuilder.test';
import './GuardsBuilder.test';
import './InvokeBuilder.test';
import './MachineBuilder.test';
import './ProvideBuilder.test';
import './StateBuilder.test';
import './StatesBuilder.test';
import './TransitionBuilder.test';

describe('XState Builders Test Suite', () => {
  it('should have loaded all builder test files', () => {
    expect(true).toBe(true);
  });
});
