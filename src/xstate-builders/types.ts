// 🎯 Tipos genéricos para XState Builder Pattern
// Estos tipos pueden ser reutilizados en cualquier aplicación

export type GenericTransition<TState, TAction, TGuard> = {
  target?: TState;
  actions?: TAction[];
  guard?: TGuard;
  delay?: string | number;
  description?: string;
};

export type GenericStateTransitionDefinition<TEvent, TState, TAction, TGuard> = {
  event: TEvent;
  transitions: GenericTransition<TState, TAction, TGuard>[];
};

// Función genérica para crear transiciones de estado
export function createStateTransitions<TEvent extends string | number | symbol, TState, TAction, TGuard>(
  stateName: TState,
  definitions: GenericStateTransitionDefinition<TEvent, TState, TAction, TGuard>[]
) {
  console.log(`🏗️ Creando transiciones para estado:`, stateName);
  
  const result: Record<TEvent, any> = {} as Record<TEvent, any>;
  
  for (const def of definitions) {
    if (def.transitions.length === 1) {
      // Si hay solo una transición, la ponemos directamente
      result[def.event] = def.transitions[0];
    } else {
      // Si hay múltiples transiciones (array), las ponemos como array
      result[def.event] = def.transitions;
    }
  }
  
  return result;
}
