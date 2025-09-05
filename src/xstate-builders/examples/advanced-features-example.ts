// 🎯 Ejemplo práctico usando las nuevas funcionalidades de XState Builders v5
// Demuestra: Tags, Meta, Description, Output, After/Always, spawnChild, enqueueActions

import { createMachine } from 'xstate';
import { 
  GenericStateBuilder, 
  GenericDelayedTransitionsBuilder,
  GenericActionsBuilder
} from '../index';

// 🏷️ Ejemplo usando TAGS para categorización robusta de estados
export const exampleWithTags = () => {
  const loadingState = GenericStateBuilder.create<string>()
    .withTag('loading')
    .withTag('visible')
    .withEntry('startSpinner')
    .withExit('stopSpinner')
    .withMeta({ 
      component: 'LoadingSpinner',
      timeout: 5000 
    })
    .withDescription('Shows loading indicator while processing data')
    .build();

  console.log('🏷️ State with Tags:', loadingState);
  return loadingState;
};

// ⏰ Ejemplo usando DELAYED TRANSITIONS (After)
export const exampleWithDelayedTransitions = () => {
  const delayedTransitions = GenericDelayedTransitionsBuilder.create<string>()
    .after(3000, 'timeout')  // Simple timeout
    .afterWithActions(1000, ['showWarning'], 'warning')  // Con acciones
    .afterWithGuard(5000, 'isStillWaiting', 'giveUp')   // Con guard
    .afterMultiple([
      { delay: 'QUICK_DELAY', target: 'quick', actions: ['logQuick'] },
      { delay: 'SLOW_DELAY', target: 'slow', guard: 'canSlow' }
    ])
    .build();

  const stateWithDelays = GenericStateBuilder.create<string>()
    .withTag('timed')
    .withAfter(delayedTransitions)
    .withAlways('autoCheck', 'shouldAutoTransition')  // Always transition
    .build();

  console.log('⏰ State with Delayed Transitions:', stateWithDelays);
  return stateWithDelays;
};

// 🏃‍♂️ Ejemplo usando SPAWN CHILD y ADVANCED ACTIONS
export const exampleWithAdvancedActions = () => {
  const actions = GenericActionsBuilder.create<string, any, any>()
    // spawnChild action
    .withSpawnChildAction('spawnWorker', 'dataWorker', { 
      id: 'worker-1', 
      input: { task: 'processData' } 
    })
    
    // enqueueActions for complex logic
    .withEnqueueActionsAction('complexProcess', (helpers: any) => {
      const { enqueue, check } = helpers;
      if (check({ type: 'hasData' })) {
        enqueue({ type: 'validateData' });
        enqueue({ type: 'processData' });
      }
    })
    
    // Other advanced actions
    .withSendParentAction('notifyParent', { type: 'CHILD_READY' })
    .withCancelAction('cancelTimeout', 'timeout-id')
    .withRaiseAction('raiseEvent', { type: 'INTERNAL_UPDATE' }, { delay: 500 })
    .withSendToAction('sendToWorker', 'worker-1', { type: 'STOP_WORK' })
    
    .build();

  console.log('🏃‍♂️ Advanced Actions:', Object.keys(actions));
  return actions;
};

// 📤 Ejemplo usando OUTPUT en estados finales
export const exampleWithFinalStates = () => {
  const successState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput({ 
      status: 'completed', 
      result: 'Data processed successfully',
      timestamp: Date.now()
    })
    .withTag('success')
    .withMeta({ level: 'info' })
    .build();

  const errorState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput({ 
      status: 'error', 
      message: 'Processing failed',
      code: 'DATA_ERROR'
    })
    .withTag('error')
    .withMeta({ level: 'error' })
    .build();

  console.log('📤 Final States with Output:', { successState, errorState });
  return { successState, errorState };
};

// 🔄 Ejemplo COMPLETO: Estados de procesamiento de datos
export const createDataProcessingStates = () => {
  const idleState = GenericStateBuilder.create<string>()
    .withTag('ready')
    .withMeta({ component: 'IdleIndicator' })
    .withDescription('Waiting for data to process')
    .build();

  const loadingState = GenericStateBuilder.create<string>()
    .withTags(['loading', 'visible'])
    .withAfter({
      10000: { 
        target: 'timeout',
        actions: ['cancelProcessing', 'notifyComplete']
      }
    })
    .withAlways('processing', 'hasDataReady')
    .withMeta({ 
      component: 'LoadingSpinner',
      timeout: 10000 
    })
    .withDescription('Loading and preparing data for processing')
    .build();

  const processingState = GenericStateBuilder.create<string>()
    .withTags(['active', 'processing'])
    .withAfter({
      30000: { target: 'timeout', actions: ['cancelProcessing'] }
    })
    .withMeta({ component: 'ProgressBar' })
    .withDescription('Actively processing data batches')
    .build();

  const successState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput({
      status: 'completed',
      processedItems: 0,
      duration: 0
    })
    .withTags(['success', 'final'])
    .withMeta({ component: 'SuccessMessage', level: 'info' })
    .withDescription('Data processing completed successfully')
    .build();

  const errorState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput({
      status: 'error',
      error: 'Unknown error',
      retryable: true
    })
    .withTags(['error', 'final'])
    .withMeta({ component: 'ErrorMessage', level: 'error' })
    .withDescription('Data processing failed with recoverable error')
    .build();

  return {
    idle: idleState,
    loading: loadingState,
    processing: processingState,
    success: successState,
    error: errorState
  };
};

// 🧪 Tests de ejemplo para demostrar uso
export const runExamples = () => {
  console.log('🎯 === XState Builders v5 - Nuevas Funcionalidades ===\n');
  
  const tagsExample = exampleWithTags();
  console.log('\n');
  
  const delayedExample = exampleWithDelayedTransitions();
  console.log('\n');
  
  const actionsExample = exampleWithAdvancedActions();
  console.log('\n');
  
  const finalStatesExample = exampleWithFinalStates();
  console.log('\n');
  
  const states = createDataProcessingStates();
  console.log('🔄 Complete Data Processing States:');
  console.log('States:', Object.keys(states));
  
  // Ejemplo básico de máquina usando las nuevas funcionalidades
  const basicMachine = createMachine({
    id: 'dataProcessor',
    initial: 'idle',
    states: states
  });
  
  console.log('✅ XState Machine created successfully!');
  
  return {
    tagsExample,
    delayedExample,
    actionsExample,
    finalStatesExample,
    states,
    basicMachine
  };
};
