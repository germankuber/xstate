// 🎯 Ejemplo práctico usando las nuevas funcionalidades de XState Builders v5
// Demuestra: Tags, Meta, Description, Output, After/Always, spawnChild, enqueueActions

import { createMachine } from 'xstate';
import {
    GenericActionOptionsBuilder,
    GenericActionsBuilder,
    GenericDelayedTransitionsBuilder,
    GenericEventBuilder,
    GenericInputBuilder,
    GenericMetaBuilder,
    GenericOutputBuilder,
    GenericSpawnOptionsBuilder,
    GenericStateBuilder
} from '../index';

// 🏷️ Ejemplo usando TAGS para categorización robusta de estados
export const exampleWithTags = () => {
  const metaConfig = GenericMetaBuilder.create()
    .withComponent('LoadingSpinner')
    .withTimeout(5000)
    .build();

  const loadingState = GenericStateBuilder.create<string>()
    .withTag('loading')
    .withTag('visible')
    .withEntry('startSpinner')
    .withExit('stopSpinner')
    .withMeta(metaConfig)
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
    // Usamos múltiples llamadas en lugar de afterMultiple
    .after('QUICK_DELAY', 'quick')
    .afterWithActions('QUICK_DELAY', ['logQuick'])
    .afterWithGuard('SLOW_DELAY', 'canSlow', 'slow')
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
  const inputConfig = GenericInputBuilder.create()
    .withTask('processData')
    .build();

  const spawnOptions = GenericSpawnOptionsBuilder.create()
    .withId('worker-1')
    .withInput(inputConfig)
    .build();

  const childReadyEvent = GenericEventBuilder.create()
    .childReady()
    .build();

  const internalUpdateEvent = GenericEventBuilder.create()
    .internalUpdate()
    .build();

  const stopWorkEvent = GenericEventBuilder.create()
    .stopWork()
    .build();

  const actions = GenericActionsBuilder.create<string, any, any>()
    // spawnChild action
    .withSpawnChildAction('spawnWorker', 'dataWorker', spawnOptions)
    
    // enqueueActions for complex logic
    .withEnqueueActionsAction('complexProcess', (helpers: any) => {
      const { enqueue, check } = helpers;
      const hasDataEvent = GenericEventBuilder.create().withType('hasData').build();
      const validateDataEvent = GenericEventBuilder.create().withType('validateData').build();
      const processDataEvent = GenericEventBuilder.create().withType('processData').build();
      
      if (check(hasDataEvent)) {
        enqueue(validateDataEvent);
        enqueue(processDataEvent);
      }
    })
    
    // Other advanced actions
    .withSendParentAction('notifyParent', childReadyEvent)
    .withCancelAction('cancelTimeout', 'timeout-id')
    .withRaiseAction('raiseEvent', internalUpdateEvent, GenericActionOptionsBuilder.create().withDelay(500).build())
    .withSendToAction('sendToWorker', 'worker-1', stopWorkEvent)
    
    .build();

  console.log('🏃‍♂️ Advanced Actions:', Object.keys(actions));
  return actions;
};

// 📤 Ejemplo usando OUTPUT en estados finales
export const exampleWithFinalStates = () => {
  const successOutput = GenericOutputBuilder.create()
    .withStatus('completed')
    .withResult('Data processed successfully')
    .withTimestamp()
    .build();

  const successMeta = GenericMetaBuilder.create()
    .withLevel('info')
    .build();

  const errorOutput = GenericOutputBuilder.create()
    .withStatus('error')
    .withMessage('Processing failed')
    .withCode('DATA_ERROR')
    .build();

  const errorMeta = GenericMetaBuilder.create()
    .withLevel('error')
    .build();

  const successState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput(successOutput)
    .withTag('success')
    .withMeta(successMeta)
    .build();

  const errorState = GenericStateBuilder.create<string>()
    .asFinalStateWithOutput(errorOutput)
    .withTag('error')
    .withMeta(errorMeta)
    .build();

  console.log('📤 Final States with Output:', { successState, errorState });
  return { successState, errorState };
};

// 🔄 Ejemplo COMPLETO: Estados de procesamiento de datos
export const createDataProcessingStates = () => {
  const idleMeta = GenericMetaBuilder.create()
    .withComponent('IdleIndicator')
    .build();

  const loadingMeta = GenericMetaBuilder.create()
    .withComponent('LoadingSpinner')
    .withTimeout(10000)
    .build();

  const processingMeta = GenericMetaBuilder.create()
    .withComponent('ProgressBar')
    .build();

  const successOutput = GenericOutputBuilder.create()
    .withStatus('completed')
    .withProcessedItems(0)
    .withDuration(0)
    .build();

  const successMeta = GenericMetaBuilder.create()
    .withComponent('SuccessMessage')
    .withLevel('info')
    .build();

  const errorOutput = GenericOutputBuilder.create()
    .withStatus('error')
    .withError('Unknown error')
    .withRetryable(true)
    .build();

  const errorMeta = GenericMetaBuilder.create()
    .withComponent('ErrorMessage')
    .withLevel('error')
    .build();

  const idleState = GenericStateBuilder.create<string>()
    .withTag('ready')
    .withMeta(idleMeta)
    .withDescription('Waiting for data to process')
    .build();

  const loadingState = GenericStateBuilder.create<string>()
    .withTags('loading', 'visible')
    .withAfter(
      GenericDelayedTransitionsBuilder.create<string>()
        .afterWithActions(10000, ['cancelProcessing', 'notifyComplete'], 'timeout')
        .build()
    )
    .withAlways('processing', 'hasDataReady')
    .withMeta(loadingMeta)
    .withDescription('Loading and preparing data for processing')
    .build();

  const processingState = GenericStateBuilder.create<string>()
    .withTags('active', 'processing')
    .withAfter(
      GenericDelayedTransitionsBuilder.create<string>()
        .afterWithActions(30000, ['cancelProcessing'], 'timeout')
        .build()
    )
    .withMeta(processingMeta)
    .withDescription('Actively processing data batches')
    .build();

  const successState = GenericStateBuilder.create<string>()
    .asFinalState()
    .withOutput(successOutput)
    .withTags('success', 'final')
    .withMeta(successMeta)
    .withDescription('Data processing completed successfully')
    .build();

  const errorState = GenericStateBuilder.create<string>()
    .asFinalState()
    .withOutput(errorOutput)
    .withTags('error', 'final')
    .withMeta(errorMeta)
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
