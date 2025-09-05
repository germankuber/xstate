// 🎯 Tipos específicos para nuestro Stepper
// Estos tipos especializan los genéricos para nuestra aplicación específica

import {
    GenericActionsBuilder,
    GenericDelaysBuilder,
    GenericGuardsBuilder,
    GenericInvokeBuilder,
    GenericMachineBuilder,
    GenericProvideBuilder,
    GenericStateBuilder,
    GenericStatesBuilder,
    GenericStepBuilder,
    GenericTransition,
    GenericTransitionBuilder
} from '../xstate-builders';

// Enum para los estados
export enum StepState {
  STEP1 = 'step1',
  STEP2 = 'step2', 
  STEP3 = 'step3',
  STEP4 = 'step4',
  LOADING_DATA = 'loadingData'
}

// Enum para los eventos
export enum StepEvent {
  NEXT = 'NEXT',
  PREV = 'PREV',
  LOAD_DATA = 'LOAD_DATA'
}

// Enum para las acciones
export enum StepAction {
  LOG_TRANSITION = 'logTransition',
  NOTIFY_STEP_CHANGE = 'notifyStepChange',
  TRACK_ANALYTICS = 'trackAnalytics',
  ON_ENTER_STEP = 'onEnterStep',
  ON_EXIT_STEP = 'onExitStep',
  RISKY_ACTION = 'riskyAction',
  AFTER_RISKY_ACTION = 'afterRiskyAction',
  SET_STEP1_NAME = 'setStep1Name',
  SET_STEP2_NAME = 'setStep2Name',
  SET_STEP3_NAME = 'setStep3Name',
  SET_STEP4_NAME = 'setStep4Name',
  ADD_VISITED_STEP = 'addVisitedStep',
  // 🚨 Nuevas acciones para cuando fallan las guardas
  ON_GUARD_FAIL = 'onGuardFail',
  LOG_API_START = 'logApiStart',
  SET_LOADING_STATE = 'setLoadingState',
  ON_VALIDATION_ERROR = 'onValidationError',
  INCREMENT_ERROR_COUNT = 'incrementErrorCount',
  // 🧪 Acciones de prueba para entender el flujo
  SUCCESS_PATH_ACTION = 'successPathAction',
  FAILURE_PATH_ACTION = 'failurePathAction',
  // 🚀 Acciones para invocaciones asíncronas
  SAVE_API_DATA = 'saveApiData',
  HANDLE_API_ERROR = 'handleApiError',
  SET_LOADING = 'setLoading',
  CLEAR_LOADING = 'clearLoading',
  ENTER_LOADING_STATE = 'enterLoadingState',
  TRANSITION_TO_LOADING = 'transitionToLoading'
}

// Enum para las guardas
export enum StepGuard {
  CAN_GO_NEXT = 'canGoNext',
  CAN_GO_PREV = 'canGoPrev',
  HAS_VALID_DATA = 'hasValidData'
}

// Enum para los delays (temporizadores)
export enum StepDelay {
  SHORT_DELAY = 'shortDelay',
  MEDIUM_DELAY = 'mediumDelay', 
  LONG_DELAY = 'longDelay',
  LOADING_TIMEOUT = 'loadingTimeout',
  VALIDATION_DEBOUNCE = 'validationDebounce'
}

// Interfaz para el context
export interface StepperContext {
  currentStepName: string;
  visitedSteps: string[];
  stepCount: number;
  errorCount: number;
  lastError?: string;
  // 🚀 Nuevos campos para invocaciones
  isLoading: boolean;
  apiData?: any;
  apiError?: string;
}

// Tipos especializados usando los genéricos
export type StepperTransition = GenericTransition<StepState, StepAction, StepGuard>;

export type StepperEvent = 
  | { type: StepEvent.NEXT }
  | { type: StepEvent.PREV }
  | { type: StepEvent.LOAD_DATA };

// Builders especializados (usando composición para mantener tipado específico)
export const TransitionBuilder = {
  create(): GenericTransitionBuilder<StepState, StepAction, StepGuard> {
    return GenericTransitionBuilder.create<StepState, StepAction, StepGuard>();
  }
};

export const StepBuilder = {
  create(stateName: StepState): GenericStepBuilder<StepState, StepEvent, StepAction, StepGuard> {
    return GenericStepBuilder.create<StepState, StepEvent, StepAction, StepGuard>(stateName);
  }
};

// Builder especializado para nuestra máquina de stepper
export const MachineBuilder = {
  create(id: string): GenericMachineBuilder<StepperContext, StepperEvent, StepState, StepAction, StepGuard> {
    return GenericMachineBuilder.create<StepperContext, StepperEvent, StepState, StepAction, StepGuard>(id);
  }
};

// Builder especializado para estados individuales
export const StateBuilder = {
  create(): GenericStateBuilder<StepAction> {
    return GenericStateBuilder.create<StepAction>();
  }
};

// Builder especializado para la colección de estados
export const StatesBuilder = {
  create(): GenericStatesBuilder<StepState> {
    return GenericStatesBuilder.create<StepState>();
  }
};

// Builder especializado para la colección de acciones
export const ActionsBuilder = {
  create(): GenericActionsBuilder<StepAction, StepperContext, StepperEvent> {
    return GenericActionsBuilder.create<StepAction, StepperContext, StepperEvent>();
  }
};

// Builder especializado para la colección de guardas
export const GuardsBuilder = {
  create(): GenericGuardsBuilder<StepGuard, StepperContext, StepperEvent> {
    return GenericGuardsBuilder.create<StepGuard, StepperContext, StepperEvent>();
  }
};

// Builder especializado para invocaciones (actores asíncronos)
export const InvokeBuilder = {
  create(): GenericInvokeBuilder<StepState, StepAction, StepperContext, StepperEvent> {
    return GenericInvokeBuilder.create<StepState, StepAction, StepperContext, StepperEvent>();
  }
};

// Builder especializado para delays (temporizadores)
export const DelaysBuilder = {
  create(): GenericDelaysBuilder<StepDelay, StepperContext, StepperEvent> {
    return GenericDelaysBuilder.create<StepDelay, StepperContext, StepperEvent>();
  }
};

// Builder especializado para el patrón .provide()
export const ProvideBuilder = {
  create(): GenericProvideBuilder<StepState, StepAction, StepGuard, StepDelay, StepperContext, StepperEvent> {
    return GenericProvideBuilder.create<StepState, StepAction, StepGuard, StepDelay, StepperContext, StepperEvent>();
  }
};
