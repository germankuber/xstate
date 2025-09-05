import { useState } from 'react'
import {
  GenericStateBuilder,
  GenericStatesBuilder,
  GenericActionsBuilder,
  GenericDelayedTransitionsBuilder,
  GenericMetaBuilder,
  GenericOutputBuilder
} from '@xstate/builders'

// Simple demo showing how the builders work
function App() {
  const [currentExample, setCurrentExample] = useState('basic')

  // Example 1: Basic state with tags and meta
  const createBasicState = () => {
    const loadingMeta = GenericMetaBuilder.create()
      .withComponent('LoadingSpinner')
      .withTimeout(5000)
      .build()

    const state = GenericStateBuilder.create()
      .withTags('loading', 'visible')
      .withMeta(loadingMeta)
      .withDescription('Shows loading indicator while processing')
      .withTransitions({
        SUCCESS: { target: 'success', actions: ['complete'] },
        CANCEL: { target: 'idle', actions: ['reset'] }
      })
      .build()

    return state
  }

  // Example 2: State with delayed transitions
  const createTimedState = () => {
    const delayedTransitions = GenericDelayedTransitionsBuilder.create()
      .after(3000, 'timeout')
      .afterWithActions(1000, ['showWarning'], 'warning')
      .afterWithGuard(5000, 'isStillWaiting', 'giveUp')
      .build()

    const state = GenericStateBuilder.create()
      .withTag('timed')
      .withAfter(delayedTransitions)
      .withAlways('autoCheck', 'shouldAutoTransition')
      .build()

    return state
  }

  // Example 3: Final state with output
  const createFinalState = () => {
    const output = GenericOutputBuilder.create()
      .withStatus('completed')
      .withResult('Processing finished successfully')
      .withTimestamp()
      .build()

    const state = GenericStateBuilder.create()
      .asFinalStateWithOutput(output)
      .withTag('success')
      .withDescription('Processing completed successfully')
      .build()

    return state
  }

  // Example 4: Actions builder
  const createActions = () => {
    const actions = GenericActionsBuilder.create()
      .withAssignAction('startLoading', { isLoading: true, progress: 0 })
      .withAssignAction('updateProgress', ({ context, event }: any) => ({
        ...context,
        progress: event.progress
      }))
      .withAssignAction('completeProcessing', { 
        isLoading: false, 
        progress: 100,
        result: 'Data processed successfully!'
      })
      .build()

    return actions
  }

  // Example 5: Complete machine structure (won't actually create XState machine)
  const createMachineStructure = () => {
    const actions = GenericActionsBuilder.create()
      .withAssignAction('startLoading', { isLoading: true })
      .build()

    const idleState = GenericStateBuilder.create()
      .withTag('ready')
      .withDescription('Waiting for user action')
      .withTransitions({
        START: { target: 'loading', actions: ['startLoading'] }
      })
      .build()

    const loadingState = GenericStateBuilder.create()
      .withTags('loading', 'visible')
      .withAfter(
        GenericDelayedTransitionsBuilder.create()
          .after(2000, 'success')
          .build()
      )
      .build()

    const successState = GenericStateBuilder.create()
      .asFinalStateWithOutput({ status: 'completed' })
      .withTag('success')
      .build()

    const states = GenericStatesBuilder.create()
      .withState('idle', idleState)
      .withState('loading', loadingState) 
      .withState('success', successState)
      .build()

    // Just return the structure for demonstration
    return {
      id: 'demoMachine',
      initial: 'idle',
      context: { isLoading: false },
      states,
      actions
    }
  }

  const examples = {
    basic: {
      title: 'Basic State with Tags & Meta',
      description: 'State with tags, meta information, and transitions',
      result: createBasicState()
    },
    timed: {
      title: 'Delayed Transitions',
      description: 'State with automatic time-based transitions',
      result: createTimedState()
    },
    final: {
      title: 'Final State with Output',
      description: 'Final state that produces structured output',
      result: createFinalState()
    },
    actions: {
      title: 'Actions Builder',
      description: 'Building complex actions with assign and regular actions',
      result: createActions()
    },
    machine: {
      title: 'Complete Machine Structure',
      description: 'Full machine built with all builders working together',
      result: createMachineStructure()
    }
  }

  const currentExampleData = examples[currentExample as keyof typeof examples]

  return (
    <div className="app">
      <h1>🎯 XState Builders Examples</h1>
      
      <div className="card">
        <h2>Builder Pattern Demonstration</h2>
        <p>
          This example shows how XState Builders create clean, type-safe, 
          and reusable state machine configurations using a fluent API.
        </p>
      </div>

      <div className="card">
        <h3>Select Example</h3>
        <div className="actions">
          {Object.entries(examples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => setCurrentExample(key)}
              className={currentExample === key ? 'active' : ''}
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{currentExampleData.title}</h3>
        <p>{currentExampleData.description}</p>
        
        <div className="result">
          <h4>Generated Configuration:</h4>
          <pre>{JSON.stringify(currentExampleData.result, null, 2)}</pre>
        </div>
      </div>

      <div className="card">
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✅ <strong>Fluent Builder API:</strong> Chainable methods for clean code</li>
          <li>✅ <strong>State Tags:</strong> Categorize states with multiple tags</li>
          <li>✅ <strong>Meta Information:</strong> Attach component and configuration data</li>
          <li>✅ <strong>Delayed Transitions:</strong> Auto-transitions with timeouts</li>
          <li>✅ <strong>Final States with Output:</strong> Structured result data</li>
          <li>✅ <strong>Type Safety:</strong> Full TypeScript support</li>
          <li>✅ <strong>Reusability:</strong> Share configurations across machines</li>
        </ul>
      </div>

      <div className="card">
        <h3>Builder Pattern Benefits</h3>
        <ul>
          <li>🔧 <strong>Modular:</strong> Build complex machines step by step</li>
          <li>🎯 <strong>Type-Safe:</strong> Catch errors at compile time</li>
          <li>📦 <strong>Reusable:</strong> Share configurations across machines</li>
          <li>🧹 <strong>Clean:</strong> More readable than raw XState config</li>
          <li>🔄 <strong>Composable:</strong> Mix and match different builders</li>
        </ul>
      </div>

      <div className="card">
        <h3>Getting Started</h3>
        <div className="code-block">
          <h4>Installation:</h4>
          <pre><code>npm install @xstate/builders xstate</code></pre>
          
          <h4>Basic Usage:</h4>
          <pre><code>{`import { 
  GenericStateBuilder,
  GenericMachineBuilder 
} from '@xstate/builders';

const state = GenericStateBuilder.create()
  .withTag('ready')
  .withDescription('Waiting for action')
  .withTransitions({
    START: { target: 'loading' }
  })
  .build();`}</code></pre>
        </div>
      </div>

      <div className="read-the-docs">
        <p>
          This library provides a fluent API for creating XState v5 machines with 
          full TypeScript support and comprehensive builder patterns.
        </p>
      </div>
    </div>
  )
}

export default App