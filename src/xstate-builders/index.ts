// 🎯 XState Builder Pattern - Exportaciones principales
// Este paquete puede ser reutilizado en cualquier aplicación que use XState

export { GenericActionOptionsBuilder } from './ActionOptionsBuilder';
export { GenericActionsBuilder } from './ActionsBuilder';
export { GenericDelayedTransitionsBuilder } from './DelayedTransitionsBuilder';
export { GenericDelaysBuilder } from './DelaysBuilder';
export { GenericEventBuilder } from './EventBuilder';
export { GenericGuardsBuilder } from './GuardsBuilder';
export { GenericInputBuilder } from './InputBuilder';
export { GenericInvokeBuilder } from './InvokeBuilder';
export { GenericMachineBuilder } from './MachineBuilder';
export { GenericMetaBuilder } from './MetaBuilder';
export { GenericOutputBuilder } from './OutputBuilder';
export { GenericProvideBuilder } from './ProvideBuilder';
export { GenericSpawnOptionsBuilder } from './SpawnOptionsBuilder';
export { GenericStateBuilder } from './StateBuilder';
export { GenericStatesBuilder } from './StatesBuilder';
export { GenericStepBuilder } from './StepBuilder';
export { GenericTransitionBuilder } from './TransitionBuilder';
export * from './types';

// Aliases convenientes para TypeScript
export type {
    GenericStateTransitionDefinition, GenericTransition
} from './types';

