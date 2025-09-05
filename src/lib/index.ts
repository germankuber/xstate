// 🎯 XState Builders Library - Main Entry Point
// Complete builder pattern implementation for XState v5+

// Export all builders
export { GenericActionOptionsBuilder } from '../xstate-builders/ActionOptionsBuilder';
export { GenericActionsBuilder } from '../xstate-builders/ActionsBuilder';
export { GenericActorsBuilder } from '../xstate-builders/ActorsBuilder';
export { GenericDelayedTransitionsBuilder } from '../xstate-builders/DelayedTransitionsBuilder';
export { GenericDelaysBuilder } from '../xstate-builders/DelaysBuilder';
export { GenericEventBuilder } from '../xstate-builders/EventBuilder';
export { GenericGuardsBuilder } from '../xstate-builders/GuardsBuilder';
export { GenericInputBuilder } from '../xstate-builders/InputBuilder';
export { GenericInvokeBuilder } from '../xstate-builders/InvokeBuilder';
export { GenericMachineBuilder } from '../xstate-builders/MachineBuilder';
export { GenericMetaBuilder } from '../xstate-builders/MetaBuilder';
export { GenericOutputBuilder } from '../xstate-builders/OutputBuilder';
export { GenericProvideBuilder } from '../xstate-builders/ProvideBuilder';
export { GenericSpawnOptionsBuilder } from '../xstate-builders/SpawnOptionsBuilder';
export { GenericStateBuilder } from '../xstate-builders/StateBuilder';
export { GenericStatesBuilder } from '../xstate-builders/StatesBuilder';
export { GenericStepBuilder } from '../xstate-builders/StepBuilder';
export { GenericTransitionBuilder } from '../xstate-builders/TransitionBuilder';

// Export all types
export * from '../xstate-builders/types';

// Convenience type aliases
export type {
    GenericStateTransitionDefinition,
    GenericTransition
} from '../xstate-builders/types';

// Main builder entry point
export { GenericMachineBuilder as XStateBuilder } from '../xstate-builders/MachineBuilder';

// Version info
export const version = '1.0.0';
export const name = '@xstate/builders';