# 🎯 XState Builders

A complete **fluent builder pattern library** for creating XState v5+ state machines with full TypeScript support. Build complex state machines using an intuitive, type-safe API that makes XState more approachable and maintainable.

![Build Status](https://img.shields.io/badge/build-passing-green)
![TypeScript](https://img.shields.io/badge/typescript-4.9+-blue)
![XState](https://img.shields.io/badge/xstate-v5+-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🏗️ **Fluent Builder Pattern**: Intuitive, chainable API for constructing state machines
- 🎯 **Full TypeScript Support**: Complete type safety with intelligent autocompletion
- 🏷️ **Advanced State Features**: Tags, meta, descriptions, outputs, and more
- ⏰ **Delayed Transitions**: Built-in support for time-based transitions
- 🔄 **Always Transitions**: Automatic state transitions with guards
- 📦 **Multi-Format Builds**: CommonJS, ES Modules, and UMD distributions
- 🧪 **Comprehensive Tests**: 400+ tests with 79% branch coverage
- 📚 **Live Examples**: Interactive React examples included

## 🚀 Quick Start

### Installation

```bash
npm install @xstate/builders xstate
```

### Basic Usage

```typescript
import { 
  GenericMachineBuilder,
  GenericStateBuilder,
  GenericStatesBuilder,
  GenericActionsBuilder
} from '@xstate/builders';

// Create actions
const actions = GenericActionsBuilder.create()
  .withAssignAction('startLoading', { isLoading: true })
  .withAssignAction('completeLoading', { isLoading: false, result: 'success' })
  .build();

// Create states with advanced features
const idleState = GenericStateBuilder.create()
  .withTag('ready')
  .withDescription('Waiting for user action')
  .withTransition('START', 'loading', ['startLoading'])
  .build();

const loadingState = GenericStateBuilder.create()
  .withTags('loading', 'visible')
  .withAfter(
    GenericDelayedTransitionsBuilder.create()
      .afterWithActions(2000, ['completeLoading'], 'success')
      .build()
  )
  .build();

const successState = GenericStateBuilder.create()
  .asFinalStateWithOutput({ status: 'completed', timestamp: Date.now() })
  .withTag('success')
  .build();

// Build the complete machine
const machine = GenericMachineBuilder.create()
  .withId('dataProcessor')
  .withInitial('idle')
  .withContext({ isLoading: false, result: null })
  .withStates(
    GenericStatesBuilder.create()
      .withState('idle', idleState)
      .withState('loading', loadingState)
      .withState('success', successState)
      .build()
  )
  .withActions(actions)
  .build();
```

### React Integration

```typescript
import { useMachine } from '@xstate/react';

function MyComponent() {
  const [state, send] = useMachine(machine);
  
  return (
    <div>
      <p>Current state: {state.value}</p>
      <p>Tags: {Array.from(state.tags).join(', ')}</p>
      
      {state.context.isLoading && <div>Loading...</div>}
      
      <button 
        onClick={() => send({ type: 'START' })}
        disabled={!state.can({ type: 'START' })}
      >
        Start Process
      </button>
    </div>
  );
}
```

## 📚 Advanced Features

### State Tags & Meta

```typescript
const state = GenericStateBuilder.create()
  .withTags('loading', 'visible', 'critical')
  .withMeta(
    GenericMetaBuilder.create()
      .withComponent('LoadingSpinner')
      .withTimeout(5000)
      .build()
  )
  .withDescription('Shows loading indicator while processing')
  .build();
```

### Delayed Transitions

```typescript
const state = GenericStateBuilder.create()
  .withAfter(
    GenericDelayedTransitionsBuilder.create()
      .after(3000, 'timeout')  // Simple timeout
      .afterWithActions(1000, ['showWarning'], 'warning')  // With actions
      .afterWithGuard(5000, 'isStillWaiting', 'giveUp')   // With guard
      .build()
  )
  .build();
```

### Final States with Output

```typescript
const finalState = GenericStateBuilder.create()
  .asFinalStateWithOutput(
    GenericOutputBuilder.create()
      .withStatus('completed')
      .withResult('Processing finished successfully')
      .withTimestamp()
      .build()
  )
  .build();
```

### Always Transitions

```typescript
const state = GenericStateBuilder.create()
  .withAlways('processing', 'hasDataReady')  // Conditional auto-transition
  .build();
```

## 🛠️ Development

### Development Scripts

```bash
# Development with hot reload
npm run dev                    # Build library in watch mode
npm run example:dev            # Start example app (port 3001)

# Building
npm run build                  # Build library (CJS, ESM, UMD)
npm run example:build          # Build example app

# Testing
npm test                       # Run tests in watch mode
npm run test:ci               # Run tests with coverage
npm run type-check            # TypeScript type checking
```

### Project Structure

```
@xstate/builders/
├── src/
│   ├── lib/                  # Library entry point
│   │   └── index.ts
│   ├── xstate-builders/      # Builder implementations  
│   │   ├── MachineBuilder.ts
│   │   ├── StateBuilder.ts
│   │   ├── ActionsBuilder.ts
│   │   └── ...
│   └── __tests__/           # Test files
├── examples/                # Example React app
│   ├── src/
│   │   └── App.tsx         # Live examples
│   └── package.json        # References parent via file:..
├── dist/                    # Built library files
│   ├── index.js            # CommonJS
│   ├── index.esm.js        # ES Modules
│   ├── index.umd.js        # UMD
│   └── index.d.ts          # TypeScript definitions
└── package.json            # Main package configuration
```

### Builder Classes Available

| Builder | Purpose | Key Methods |
|---------|---------|-------------|
| `GenericMachineBuilder` | Complete state machines | `withId()`, `withStates()`, `withActions()` |
| `GenericStateBuilder` | Individual states | `withTag()`, `withMeta()`, `withAfter()`, `withAlways()` |
| `GenericStatesBuilder` | State collections | `withState()`, `build()` |
| `GenericActionsBuilder` | Actions | `withAssignAction()`, `withSendAction()`, `withSpawnChildAction()` |
| `GenericDelayedTransitionsBuilder` | Time-based transitions | `after()`, `afterWithActions()`, `afterWithGuard()` |
| `GenericOutputBuilder` | Final state outputs | `withStatus()`, `withResult()`, `withTimestamp()` |
| `GenericMetaBuilder` | State metadata | `withComponent()`, `withTimeout()`, `withLevel()` |

## 📦 Multi-Format Distribution

The library is distributed in multiple formats for maximum compatibility:

- **CommonJS** (`dist/index.js`): For Node.js and older bundlers
- **ES Modules** (`dist/index.esm.js`): For modern bundlers and browsers  
- **UMD** (`dist/index.umd.js`): For direct browser usage
- **TypeScript** (`dist/index.d.ts`): Complete type definitions

## 🎯 Why Use XState Builders?

### Before (Raw XState):
```typescript
const machine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: {
      tags: ['off'],
      meta: { color: 'red' },
      on: {
        TOGGLE: {
          target: 'active',
          actions: ['setActive']
        }
      }
    },
    active: {
      tags: ['on'],
      meta: { color: 'green' },
      after: {
        5000: 'inactive'
      },
      on: {
        TOGGLE: {
          target: 'inactive', 
          actions: ['setInactive']
        }
      }
    }
  }
});
```

### After (XState Builders):
```typescript
const machine = GenericMachineBuilder.create()
  .withId('toggle')
  .withInitial('inactive')
  .withStates(
    GenericStatesBuilder.create()
      .withState('inactive', 
        GenericStateBuilder.create()
          .withTag('off')
          .withMeta({ color: 'red' })
          .withTransition('TOGGLE', 'active', ['setActive'])
          .build()
      )
      .withState('active',
        GenericStateBuilder.create()
          .withTag('on') 
          .withMeta({ color: 'green' })
          .withAfter(
            GenericDelayedTransitionsBuilder.create()
              .after(5000, 'inactive')
              .build()
          )
          .withTransition('TOGGLE', 'inactive', ['setInactive'])
          .build()
      )
      .build()
  )
  .build();
```

### Benefits:

- 🔧 **More Readable**: Self-documenting, fluent API
- 🎯 **Type Safe**: Catch errors at compile time
- 📦 **Reusable**: Share builder configurations
- 🧩 **Composable**: Mix and match builders
- 🛡️ **Reliable**: Comprehensive test coverage

## 📊 Test Coverage

The library maintains high test coverage across all builders:

```
Test Suites: 16 passed
Tests:       425 passed
Coverage:    79% branches, 55% statements
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [XState Documentation](https://xstate.js.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Examples (Live Demo)](./examples/)

---

Built with ❤️ for the XState community