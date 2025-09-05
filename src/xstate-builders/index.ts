// 🎯 XState Builder Pattern - Exportaciones principales
// Este paquete puede ser reutilizado en cualquier aplicación que use XState

export { GenericActionsBuilder } from './ActionsBuilder';
export { GenericDelaysBuilder } from './DelaysBuilder';
export { GenericGuardsBuilder } from './GuardsBuilder';
export { GenericInvokeBuilder } from './InvokeBuilder';
export { GenericMachineBuilder } from './MachineBuilder';
export { GenericProvideBuilder } from './ProvideBuilder';
export { GenericStateBuilder } from './StateBuilder';
export { GenericStatesBuilder } from './StatesBuilder';
export { GenericStepBuilder } from './StepBuilder';
export { GenericTransitionBuilder } from './TransitionBuilder';
export * from './types';

// Aliases convenientes para TypeScript
export type {
    GenericStateTransitionDefinition, GenericTransition
} from './types';

