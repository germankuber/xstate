# 🚀 XState Builder Pattern Library

A comprehensive, type-safe builder pattern library for XState v5 that eliminates anonymous objects and provides a fluent, reusable API for creating state machines.

![XState Builder Pattern Demo](https://img.shields.io/badge/XState-v5-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![React](https://img.shields.io/badge/React-Compatible-61dafb) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8) ![Visual Debugging](https://img.shields.io/badge/Visual-Debugging-green)

## ✨ Features

- 🎯 **Zero Anonymous Objects** - Eliminate all anonymous objects with fluent builders
- 🔒 **Full Type Safety** - Complete TypeScript support with generic constraints
- 🧩 **Modular Architecture** - Reusable builders across any XState project
- 🎨 **Fluent API** - Chainable methods for better developer experience
- 🚀 **XState v5 Ready** - Built for the latest XState features
- 📦 **Pattern Library** - Collection of specialized builders for common patterns
- ⚡ **Performance Optimized** - Efficient builder pattern implementation
- 👁️ **Visual Debugging** - Real-time state machine visualization with Stately Studio integration

## 🏗️ Architecture Overview

### Core Builders

| Builder | Purpose | Features |
|---------|---------|----------|
| `MachineBuilder` | Main state machine definition | Context, states, actions, guards, delays |
| `StatesBuilder` | Collection of states | Multiple state definitions |
| `StateBuilder` | Individual state definition | Entry/exit actions, transitions, invoke |
| `TransitionBuilder` | State transitions | Target, actions, guards, delays |
| `ActionsBuilder` | Action implementations | Regular and assign actions |
| `GuardsBuilder` | Guard implementations | Typed guard functions |
| `DelaysBuilder` | Delay configurations | Fixed, dynamic, and referenced delays |
| `InvokeBuilder` | Actor invocations | Promise-based actors with onDone/onError |
| `ProvideBuilder` | Implementation provider | `.provide()` pattern support |

### Specialized Builders

- `StepBuilder` - Fluent transition definitions for specific states
- `Generic*Builder` - Base generic implementations
- Type-safe factory functions for project-specific builders

## 🚀 Quick Start

### Installation

```bash
npm install xstate @xstate/react
# For visual debugging and inspection
npm install @statelyai/inspect
# For the demo UI
npm install -D tailwindcss postcss autoprefixer
```

### Basic Usage

```typescript
import { MachineBuilder, StatesBuilder, ActionsBuilder } from './xstate-builders';

// 1. Create base machine structure
const baseMachine = MachineBuilder.create('myMachine')
  .withInitialState('idle')
  .withContext({ count: 0 })
  .withStates(
    StatesBuilder.create()
      .withState('idle', StateBuilder.create()
        .withTransitions(/* ... */)
        .build())
      .build()
  )
  .build();

// 2. Provide implementations
const machine = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(ActionsBuilder.create()
      .withAction('increment', ({ context }) => {
        console.log('Incrementing:', context.count);
      })
      .withAssignAction('updateCount', assign({
        count: ({ context }) => context.count + 1
      }))
      .build())
    .build()
);
```

## 📋 Builder Patterns

### 1. Actions Builder

Supports both regular actions and assign actions:

```typescript
ActionsBuilder.create()
  // Regular action (side effects)
  .withAction('logTransition', ({ context }, event) => {
    console.log('Transition:', event.type);
  })
  // Assign action (context updates)
  .withAssignAction('updateUser', assign({
    user: (_, event) => event.data,
    lastUpdated: () => Date.now()
  }))
  .build()
```

### 2. Guards Builder

Type-safe guard implementations:

```typescript
GuardsBuilder.create()
  .withGuard('canProceed', ({ context }) => {
    return context.isValid && context.hasPermission;
  })
  .withGuard('isAuthorized', ({ context }, event) => {
    return context.user?.role === 'admin';
  })
  .build()
```

### 3. Delays Builder

Multiple delay types supported:

```typescript
DelaysBuilder.create()
  // Fixed delay
  .withDelay('shortDelay', 500)
  // Dynamic delay based on context
  .withDynamicDelay('retryDelay', (context) => {
    return context.retryCount * 1000; // Exponential backoff
  })
  // Reference to another delay
  .withDelayReference('timeout', 'longDelay')
  .build()
```

### 4. Invoke Builder

Actor invocations with error handling:

```typescript
InvokeBuilder.create()
  .withSource(fetchUserData)
  .onDone('success', 'saveUserData')
  .onError('error', 'handleError')
  .build()
```

### 5. Provide Builder

The `.provide()` pattern for separating structure from implementation:

```typescript
const machineWithImplementations = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(/* ActionsBuilder */)
    .withGuards(/* GuardsBuilder */)
    .withDelays(/* DelaysBuilder */)
    .withActors({
      fetchUserData: async () => { /* implementation */ }
    })
    .build()
);
```

## 🎯 Real-World Example

### Step-by-Step Wizard

```typescript
// Define states
enum WizardState {
  STEP1 = 'step1',
  STEP2 = 'step2',
  STEP3 = 'step3',
  LOADING = 'loading',
  COMPLETE = 'complete'
}

// Create specialized builders
const StepBuilder = {
  create: (state: WizardState) => 
    GenericStepBuilder.create<WizardState, WizardEvent, WizardAction, WizardGuard>(state)
};

// Build the machine
const wizardMachine = MachineBuilder.create('wizard')
  .withInitialState(WizardState.STEP1)
  .withTypes<WizardContext, WizardEvent>()
  .withContext({
    currentStep: 1,
    formData: {},
    isValid: false
  })
  .withStates(
    StatesBuilder.create()
      .withState(
        WizardState.STEP1,
        StateBuilder.create()
          .withEntry('validateStep')
          .withTransitions(
            StepBuilder.create(WizardState.STEP1)
              .withTransitionDefinition(
                'NEXT',
                TransitionBuilder.create()
                  .to(WizardState.STEP2)
                  .withActions('saveStep1Data')
                  .guardedBy('isStep1Valid')
                  .withDelay('transitionDelay')
                  .build()
              )
              .build()
          )
          .build()
      )
      .withState(
        WizardState.LOADING,
        StateBuilder.create()
          .withInvoke(
            InvokeBuilder.create()
              .withSource('submitForm')
              .onDone(WizardState.COMPLETE, 'handleSuccess')
              .onError(WizardState.STEP3, 'handleSubmissionError')
              .build()
          )
          .build()
      )
      .build()
  )
  .build();

// Provide implementations
const machine = wizardMachine.provide(
  ProvideBuilder.create()
    .withActions(
      ActionsBuilder.create()
        .withAssignAction('saveStep1Data', assign({
          formData: ({ context }, event) => ({
            ...context.formData,
            step1: event.data
          })
        }))
        .withAction('validateStep', ({ context }) => {
          console.log('Validating step:', context.currentStep);
        })
        .build()
    )
    .withGuards(
      GuardsBuilder.create()
        .withGuard('isStep1Valid', ({ context }) => {
          return Object.keys(context.formData).length > 0;
        })
        .build()
    )
    .withDelays(
      DelaysBuilder.create()
        .withDelay('transitionDelay', 300)
        .withDynamicDelay('retryDelay', (context) => {
          return context.retryCount * 500;
        })
        .build()
    )
    .withActors({
      submitForm: async (context) => {
        const response = await fetch('/api/submit', {
          method: 'POST',
          body: JSON.stringify(context.formData)
        });
        return response.json();
      }
    })
    .build()
);
```

## 🎨 UI Integration

### React Hook Usage

```typescript
import { useMachine } from '@xstate/react';

export const WizardComponent = () => {
  const [state, send] = useMachine(machine);
  
  const { currentStep, isValid } = state.context;
  const canGoNext = state.can('NEXT');
  
  return (
    <div className="wizard-container">
      <StepIndicator current={currentStep} />
      <FormStep state={state} />
      <NavigationButtons 
        onNext={() => send({ type: 'NEXT' })}
        onPrev={() => send({ type: 'PREV' })}
        canGoNext={canGoNext}
      />
    </div>
  );
};
```

### Tailwind CSS Styling

The demo includes a beautiful Tailwind CSS implementation:

```typescript
// Modern gradient background
<div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700">
  
  // Glass morphism cards
  <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl">
    
    // Interactive buttons with hover effects
    <button className={`
      px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform
      ${canGoNext 
        ? 'bg-green-500 hover:bg-green-600 hover:-translate-y-0.5 shadow-lg' 
        : 'bg-gray-300 cursor-not-allowed'
      }
    `}>
      Next →
    </button>
```

## 👁️ Visual Debugging & State Machine Visualization

One of XState's most powerful features is the ability to visualize and debug your state machines in real-time. Here are the different ways to see your machine in action:

### 🎯 1. Stately Studio (Official - Recommended)

The most comprehensive visualization tool with live debugging capabilities.

**Setup:**
1. Go to [https://stately.ai/studio](https://stately.ai/studio)
2. Import your machine by copying the code
3. See your state machine as an interactive diagram
4. Simulate events and watch state/context changes in real-time

**Live Connection with @statelyai/inspect:**

```bash
npm install @statelyai/inspect
```

```typescript
import { createBrowserInspector } from '@statelyai/inspect';
import { useMachine } from '@xstate/react';

// Create inspector instance
const inspector = createBrowserInspector({
  autoStart: true
});

// Connect your machine
export const MyComponent = () => {
  const [state, send] = useMachine(myMachine, {
    inspect: inspector.inspect
  });
  
  return (
    <div>
      {/* Your UI */}
      <button onClick={() => send({ type: 'NEXT' })}>
        Next Step
      </button>
    </div>
  );
};
```

**What you get:**
- 📊 Live state diagram updates as you interact with your app
- 🔍 Real-time context inspection
- 📝 Event timeline with full history
- 🎮 Event simulation directly from the diagram
- 🚀 Connect multiple machines simultaneously

### 🎨 2. XState Visualizer (Quick & Static)

Perfect for quick validation and sharing diagrams.

**Usage:**
1. Go to [https://stately.ai/viz](https://stately.ai/viz)
2. Paste your machine definition code
3. See the instant diagram

**Example - Export your machine for visualization:**

```typescript
// Add this to your component for easy copying
const machineForVisualization = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(/* your actions */)
    .withGuards(/* your guards */)
    .build()
);

console.log('Machine for Stately Viz:', machineForVisualization);
```

### ⚙️ 3. Integrated DevTools

Enable debugging directly in your app with browser extensions.

```typescript
import { useMachine } from '@xstate/react';

export const MyComponent = () => {
  const [state, send] = useMachine(myMachine, {
    devTools: true // Enable Redux DevTools integration
  });
  
  return <div>Your app</div>;
};
```

**Browser Extensions:**
- [Redux DevTools](https://github.com/reduxjs/redux-devtools) - See state transitions
- [XState DevTools](https://chrome.google.com/webstore/detail/xstate-devtools) - Specialized XState inspector

### 🔧 Demo Setup with Visual Debugging

Our demo application is already configured with visual debugging! Here's how it works:

```typescript
// In src/Toggler.tsx
import { createBrowserInspector } from '@statelyai/inspect';

// 🔍 Visual inspector setup
const inspector = createBrowserInspector({
  autoStart: true
});

export const Toggler = () => {
  const [state, send] = useMachine(stepperMachine, {
    inspect: inspector.inspect // 🎯 Connect to visual debugger
  });
  
  // Your component logic...
};
```

### 🚀 Try It Now!

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Open the inspector:**
   - The browser inspector will automatically open in a new tab
   - Or go to [https://stately.ai/inspect](https://stately.ai/inspect)

3. **Interact with the stepper:**
   - Click "Next" and "Previous" buttons
   - Watch the state machine diagram update in real-time
   - See the context changes (step counts, visited steps, etc.)
   - Try triggering errors and see error handling

### 📊 What You'll See in the Visual Debugger

- **State Diagram:** Interactive flowchart of your machine
- **Current State:** Highlighted active state
- **Context Panel:** Live context data updates
- **Event Log:** History of all events sent
- **Event Simulator:** Send events directly from the diagram

### 🎯 Debugging Workflow

1. **Design Phase:** Use Stately Studio to design and validate your state machine
2. **Development:** Use `@statelyai/inspect` for live debugging
3. **Testing:** Use the visualizer to share and review state flows
4. **Production:** Disable devTools for performance

### 💡 Pro Tips

- **Multiple Machines:** Connect several machines to see their interactions
- **State Guards:** Visualize guard conditions and why transitions fail/succeed
- **Async Operations:** Watch invoke actors and their lifecycle
- **Context Evolution:** Track how context changes through the application flow

**Visual debugging transforms XState development from guessing to understanding!** 🎯
```

## 📁 Project Structure

```
src/
├── xstate-builders/           # Generic builder library
│   ├── ActionsBuilder.ts      # Action implementations
│   ├── DelaysBuilder.ts       # Delay configurations  
│   ├── GuardsBuilder.ts       # Guard implementations
│   ├── InvokeBuilder.ts       # Actor invocations
│   ├── MachineBuilder.ts      # Main machine builder
│   ├── ProvideBuilder.ts      # Implementation provider
│   ├── StateBuilder.ts        # Individual states
│   ├── StatesBuilder.ts       # State collections
│   ├── StepBuilder.ts         # Transition definitions
│   ├── TransitionBuilder.ts   # Individual transitions
│   ├── types.ts              # Generic types
│   └── index.ts              # Exports
├── stepper/                   # Project-specific implementations
│   └── types.ts              # Specialized builders & types
└── Toggler.tsx               # Demo component
```

## 🔧 Configuration

### TypeScript Configuration

Ensure strict type checking for better developer experience:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Tailwind Configuration

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in'
      }
    }
  },
  plugins: []
}
```

## 🛠️ Advanced Patterns

### Custom Builder Extension

```typescript
// Extend existing builders for domain-specific needs
export class CustomActionsBuilder extends GenericActionsBuilder {
  withApiCall(actionName: string, endpoint: string) {
    return this.withAction(actionName, async ({ context }, event) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(event.data)
      });
      return response.json();
    });
  }
}
```

### Builder Composition

```typescript
// Compose multiple builders for complex scenarios
const createComplexMachine = (config: MachineConfig) => {
  return MachineBuilder.create(config.id)
    .withInitialState(config.initialState)
    .withStates(buildStates(config.states))
    .withActions(buildActions(config.actions))
    .withGuards(buildGuards(config.guards))
    .build();
};
```

## 📚 API Reference

### MachineBuilder

| Method | Description | Returns |
|--------|-------------|---------|
| `create(id)` | Create new machine builder | `MachineBuilder` |
| `withInitialState(state)` | Set initial state | `MachineBuilder` |
| `withContext(context)` | Set initial context | `MachineBuilder` |
| `withTypes<TContext, TEvent>()` | Add type annotations | `MachineBuilder` |
| `withStates(states)` | Add state definitions | `MachineBuilder` |
| `build()` | Build the machine | `StateMachine` |

### ActionsBuilder

| Method | Description | Returns |
|--------|-------------|---------|
| `create()` | Create new actions builder | `ActionsBuilder` |
| `withAction(name, fn)` | Add regular action | `ActionsBuilder` |
| `withAssignAction(name, assignment)` | Add assign action | `ActionsBuilder` |
| `build()` | Build actions config | `Actions` |

### GuardsBuilder

| Method | Description | Returns |
|--------|-------------|---------|
| `create()` | Create new guards builder | `GuardsBuilder` |
| `withGuard(name, fn)` | Add guard function | `GuardsBuilder` |
| `build()` | Build guards config | `Guards` |

## 🚀 Performance Tips

1. **Builder Reuse**: Create builder instances once and reuse them
2. **Type Inference**: Let TypeScript infer types where possible
3. **Lazy Evaluation**: Use factory functions for expensive operations
4. **Memory Management**: Avoid creating unnecessary closures in actions

## 🧪 Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('Wizard Machine', () => {
  it('should start in step1', () => {
    const machine = createWizardMachine();
    expect(machine.initialState.value).toBe('step1');
  });
  
  it('should transition to step2 when valid', () => {
    const machine = createWizardMachine();
    const state = machine.transition('step1', { type: 'NEXT' });
    expect(state.value).toBe('step2');
  });
});
```

## 🚀 Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode with live reload.
Open [http://localhost:3000](http://localhost:3000) to view the demo.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [XState Team](https://github.com/statelyai/xstate) for the amazing state management library
- [React Team](https://reactjs.org/) for the UI framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 🔗 Links

- [XState Documentation](https://xstate.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

<div align="center">
  <strong>Built with ❤️ using XState Builder Pattern</strong>
</div>
