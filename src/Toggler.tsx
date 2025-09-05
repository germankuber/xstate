import { createBrowserInspector } from '@statelyai/inspect';
import { useMachine } from '@xstate/react';
import { assign } from 'xstate';
import './Toggler.css';
import {
    ActionsBuilder,
    DelaysBuilder,
    GuardsBuilder,
    InvokeBuilder,
    MachineBuilder,
    ProvideBuilder,
    StateBuilder,
    StatesBuilder,
    StepAction,
    StepBuilder,
    StepDelay,
    StepEvent,
    StepGuard,
    StepperContext,
    StepperEvent,
    StepState,
    TransitionBuilder
} from './stepper/types';

// � Configurar inspector visual de XState
const inspector = createBrowserInspector({
  autoStart: true
});

// �🚀 Función simulada de API para demostrar invoke
const fetchUserData = async (): Promise<{ name: string; email: string; preferences: string[] }> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular posible error (20% de probabilidad)
  if (Math.random() < 0.2) {
    throw new Error('Error de red: No se pudo cargar los datos del usuario');
  }
  
  return {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    preferences: ['notifications', 'dark-mode', 'auto-save']
  };
};

// 🎯 Máquina base SIN implementaciones (solo la estructura)
const baseMachine = MachineBuilder.create('stepperBase')
  .withInitialState(StepState.STEP1)
  .withTypes<StepperContext, StepperEvent>()
  .withContext({
    currentStepName: 'Inicio',
    visitedSteps: ['Inicio'],
    stepCount: 1,
    errorCount: 0,
    isLoading: false,
    apiData: undefined,
    apiError: undefined,
    lastError: undefined
  } as StepperContext)
  .withStates(
    StatesBuilder.create()
      .withState(
        StepState.STEP1,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP)
          .withTransitions(
            StepBuilder.create(StepState.STEP1)
              .withTransitionDefinition(
                StepEvent.NEXT,
                TransitionBuilder.create()
                  .to(StepState.STEP2)
                  .withActions(StepAction.LOG_TRANSITION)
                  .withDelay(StepDelay.SHORT_DELAY)
                  .build()
              )
              .build()
          )
          .build()
      )
      .withState(
        StepState.STEP2,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP)
          .withTransitions(
            StepBuilder.create(StepState.STEP2)
              .withTransitionDefinition(
                StepEvent.NEXT,
                TransitionBuilder.create()
                  .to(StepState.LOADING_DATA)
                  .withActions(StepAction.SET_LOADING)
                  .build()
              )
              .withTransitionDefinition(
                StepEvent.PREV,
                TransitionBuilder.create()
                  .to(StepState.STEP1)
                  .withActions(StepAction.LOG_TRANSITION)
                  .guardedBy(StepGuard.CAN_GO_PREV)
                  .build()
              )
              .build()
          )
          .build()
      )
      .withState(
        StepState.LOADING_DATA,
        StateBuilder.create()
          .withEntry(StepAction.SET_LOADING)
          .withExit(StepAction.CLEAR_LOADING)
          .withInvoke(
            InvokeBuilder.create()
              .withSource('fetchUserData')
              .onDone(StepState.STEP3, StepAction.SAVE_API_DATA)
              .onError(StepState.STEP2, StepAction.HANDLE_API_ERROR)
              .build()
          )
          .build()
      )
      .withState(
        StepState.STEP3,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP)
          .withTransitions(
            StepBuilder.create(StepState.STEP3)
              .withTransitionDefinition(
                StepEvent.NEXT,
                TransitionBuilder.create()
                  .to(StepState.STEP4)
                  .withActions(StepAction.LOG_TRANSITION)
                  .guardedBy(StepGuard.HAS_VALID_DATA)
                  .withDelay(StepDelay.VALIDATION_DEBOUNCE)
                  .build()
              )
              .build()
          )
          .build()
      )
      .withState(
        StepState.STEP4,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP)
          .build()
      )
      .build()
  )
  .build();

// 🚀 Máquina CON implementaciones usando el patrón .provide()
const stepperMachine = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(
      ActionsBuilder.create()
        .withAction(StepAction.LOG_TRANSITION, ({ context }, event) => {
          console.log('🎯 [PROVIDE] Transición ejecutada:', { 
            from: context.currentStepName, 
            eventType: (event as StepperEvent)?.type || 'unknown'
          });
        })
        .withAction(StepAction.ON_ENTER_STEP, ({ context }) => {
          console.log('🚪 [PROVIDE] Entrando al estado:', context.currentStepName);
        })
        .withAssignAction(StepAction.SET_LOADING, assign({
          isLoading: true,
          apiError: undefined
        }))
        .withAssignAction(StepAction.CLEAR_LOADING, assign({
          isLoading: false
        }))
        .withAssignAction(StepAction.SAVE_API_DATA, assign({
          apiData: (_, event: any) => event.data,
          isLoading: false,
          currentStepName: 'Datos cargados exitosamente'
        }))
        .withAssignAction(StepAction.HANDLE_API_ERROR, assign({
          apiError: (_, event: any) => event.data?.message || 'Error desconocido',
          isLoading: false,
          errorCount: ({ context }) => context.errorCount + 1
        }))
        .build()
    )
    .withGuards(
      GuardsBuilder.create()
        .withGuard(StepGuard.CAN_GO_PREV, ({ context }) => {
          console.log('🛡️ [PROVIDE] Verificando si puede retroceder...');
          return context.stepCount > 1;
        })
        .withGuard(StepGuard.HAS_VALID_DATA, ({ context }) => {
          console.log('🛡️ [PROVIDE] Verificando validez de datos...');
          return context.apiData !== undefined;
        })
        .build()
    )
    .withDelays(
      DelaysBuilder.create()
        .withDelay(StepDelay.SHORT_DELAY, 500)
        .withDelay(StepDelay.MEDIUM_DELAY, 1500)
        .withDelay(StepDelay.LONG_DELAY, 3000)
        .withDelayReference(StepDelay.LOADING_TIMEOUT, StepDelay.LONG_DELAY)
        .withDynamicDelay(StepDelay.VALIDATION_DEBOUNCE, (context) => {
          // Delay más largo si hay errores previos
          return context.errorCount > 0 ? 2000 : 800;
        })
        .build()
    )
    .withActors({
      fetchUserData: fetchUserData
    })
    .build()
);

const getStepInfo = (currentStep: string) => {
  const steps = {
    [StepState.STEP1]: { number: 1, title: 'Inicio', description: 'Primer paso del proceso' },
    [StepState.STEP2]: { number: 2, title: 'Configuración', description: 'Configura tus preferencias' },
    [StepState.STEP3]: { number: 3, title: 'Revisión', description: 'Revisa la información ingresada' },
    [StepState.STEP4]: { number: 4, title: 'Finalización', description: 'Proceso completado' },
    [StepState.LOADING_DATA]: { number: 0, title: 'Cargando...', description: 'Obteniendo datos del servidor' }
  };
  return steps[currentStep as StepState];
};

export const Toggler = () => {
  const [state, send] = useMachine(stepperMachine, {
    inspect: inspector.inspect
  });
  const currentStepInfo = getStepInfo(state.value as string);
  
  const canGoNext = !state.matches(StepState.STEP4) && !state.matches(StepState.LOADING_DATA);
  const canGoPrev = !state.matches(StepState.STEP1) && !state.matches(StepState.LOADING_DATA);

  // 🎯 Acceso al context
  const { 
    currentStepName, 
    visitedSteps, 
    stepCount, 
    errorCount, 
    lastError,
    isLoading,
    apiData,
    apiError 
  } = state.context;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #7c3aed)', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* 🎯 Header Principal */}
        <div style={{ textAlign: 'center', marginBottom: '30px', color: 'white' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
            🚀 XState Builder Pattern Demo
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Patrón .provide() con DelaysBuilder, InvokeBuilder y más
          </p>
        </div>

        {/* 🎯 Header con información de debug */}
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          padding: '25px', 
          marginBottom: '25px', 
          borderRadius: '12px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#374151', marginBottom: '15px' }}>
            🔧 Estado de Debug
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280' }}>Estado actual</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>{state.value as string}</div>
            </div>
            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280' }}>Nombre del paso</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>{currentStepName}</div>
            </div>
            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280' }}>Contador de pasos</div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>{stepCount}</div>
            </div>
            <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280' }}>Errores</div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '600', 
                color: errorCount > 0 ? '#dc2626' : '#374151' 
              }}>
                {errorCount}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-100 rounded-lg mb-4">
            <div className="text-sm font-medium text-gray-600">Pasos visitados</div>
            <div className="text-base font-semibold text-gray-800 mt-1">
              {visitedSteps.join(' → ')}
            </div>
          </div>

          {(lastError || isLoading || apiData || apiError) && (
            <div className="space-y-2">
              {lastError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Último error</div>
                  <div className="text-sm text-red-700">{lastError}</div>
                </div>
              )}
              {isLoading && (
                <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">🔄 Estado</div>
                  <div className="text-sm text-yellow-700">Cargando datos...</div>
                </div>
              )}
              {apiData && (
                <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">📊 API Data</div>
                  <div className="text-sm text-green-700">Datos disponibles</div>
                </div>
              )}
              {apiError && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="text-sm font-medium text-red-800">❌ API Error</div>
                  <div className="text-sm text-red-700">{apiError}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar mejorado */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-xl mb-6">
          <div className="mb-5">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                      ${currentStepInfo?.number >= step 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' 
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {currentStepInfo?.number > step ? '✓' : step}
                  </div>
                  <div className={`
                    text-xs mt-2 font-medium
                    ${currentStepInfo?.number >= step ? 'text-gray-800' : 'text-gray-400'}
                  `}>
                    Step {step}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepInfo?.number - 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Información del paso actual */}
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">
              {currentStepInfo?.title}
            </h2>
            <p className="text-lg text-gray-600 opacity-80">
              {currentStepInfo?.description}
            </p>
          </div>
        </div>

        {/* Botones de navegación mejorados */}
        <div className="flex gap-4 justify-center flex-wrap mb-8">
          <button 
            onClick={() => send({ type: StepEvent.PREV })}
            disabled={!canGoPrev}
            className={`
              px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform
              ${canGoPrev 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }
            `}
          >
            ← Anterior
          </button>
          
          <button 
            onClick={() => send({ type: StepEvent.NEXT })}
            disabled={!canGoNext}
            className={`
              px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform
              ${canGoNext 
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              }
            `}
          >
            Siguiente →
          </button>
        </div>

        {/* 🚀 Mostrar información de la API */}
        {isLoading && (
          <div className="mt-5 p-4 bg-yellow-100 border border-yellow-200 rounded-lg text-center">
            <div className="text-yellow-800 font-medium">⏳ Cargando datos desde el servidor...</div>
            <div className="mt-2 text-sm text-yellow-600">
              Esto puede tomar unos segundos
            </div>
          </div>
        )}

        {apiData && (
          <div className="mt-5 p-4 bg-green-100 border border-green-200 rounded-lg">
            <h4 className="text-green-800 font-semibold mb-2">✅ Datos cargados exitosamente:</h4>
            <pre className="text-xs mt-2 bg-green-50 p-3 rounded overflow-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}

        {apiError && (
          <div className="mt-5 p-4 bg-red-100 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-semibold mb-2">❌ Error al cargar datos:</h4>
            <div className="text-red-700 mt-2">
              {apiError}
            </div>
          </div>
        )}

        {/* 🚀 Cheat Sheet del patrón .provide() */}
        <div className="mt-10 p-6 bg-gray-50 border border-gray-200 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Cheat Sheet: Patrón .provide()</h3>
          <div className="text-sm leading-relaxed space-y-4">
            <div>
              <p className="font-semibold text-gray-700 mb-2">🎯 Estructura básica:</p>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
{`const machineWithImpls = baseMachine.provide({
  actions: { /* implementaciones */ },
  guards: { /* implementaciones */ },
  delays: { /* implementaciones */ },
  actors: { /* implementaciones */ }
});`}
              </pre>
            </div>
            
            <div>
              <p className="font-semibold text-gray-700 mb-2">🚀 Con nuestros builders:</p>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto">
{`const machine = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(ActionsBuilder.create()...)
    .withGuards(GuardsBuilder.create()...)
    .withDelays(DelaysBuilder.create()...)
    .withActors({ fetchData: fetchFunction })
    .build()
);`}
              </pre>
            </div>

            <div>
              <p className="font-semibold text-gray-700 mb-2">⏱️ Tipos de delays implementados:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li><code className="bg-gray-200 px-2 py-1 rounded text-xs">.withDelay(name, milliseconds)</code> - Delay fijo</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded text-xs">.withDynamicDelay(name, function)</code> - Delay dinámico</li>
                <li><code className="bg-gray-200 px-2 py-1 rounded text-xs">.withDelayReference(name, reference)</code> - Referencia a otro delay</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
