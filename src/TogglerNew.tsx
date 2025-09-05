import { useMachine } from '@xstate/react';
import { assign } from 'xstate';
import { GenericActorsBuilder } from './xstate-builders';
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

// 🚀 Función simulada de API para demostrar invoke
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
    .withActors(
      GenericActorsBuilder.create()
        .withFetchUserData(fetchUserData)
        .build()
    )
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
  const [state, send] = useMachine(stepperMachine);
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
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* 🎯 Header con información de debug */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        marginBottom: '20px', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>🔧 Estado de Debug</h3>
        <p><strong>Estado actual:</strong> {state.value as string}</p>
        <p><strong>Nombre del paso:</strong> {currentStepName}</p>
        <p><strong>Pasos visitados:</strong> {visitedSteps.join(' → ')}</p>
        <p><strong>Contador de pasos:</strong> {stepCount}</p>
        <p><strong>Errores:</strong> {errorCount}</p>
        {lastError && <p><strong>Último error:</strong> {lastError}</p>}
        {isLoading && <p><strong>🔄 Estado:</strong> Cargando datos...</p>}
        {apiData && <p><strong>📊 API Data:</strong> Datos disponibles</p>}
        {apiError && <p style={{ color: 'red' }}><strong>❌ API Error:</strong> {apiError}</p>}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: currentStepInfo?.number >= step ? '#007acc' : '#e0e0e0',
                color: currentStepInfo?.number >= step ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {step}
            </div>
          ))}
        </div>
        <div style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '2px' 
        }}>
          <div style={{
            width: `${((currentStepInfo?.number - 1) / 3) * 100}%`,
            height: '100%',
            backgroundColor: '#007acc',
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Información del paso actual */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>
          Paso {currentStepInfo?.number}: {currentStepInfo?.title}
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          {currentStepInfo?.description}
        </p>
      </div>

      {/* Botones de navegación */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => send({ type: StepEvent.PREV })}
          disabled={!canGoPrev}
          style={{
            padding: '10px 20px',
            backgroundColor: canGoPrev ? '#ff6b6b' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          ← Anterior
        </button>
        
        <button 
          onClick={() => send({ type: StepEvent.NEXT })}
          disabled={!canGoNext}
          style={{
            padding: '10px 20px',
            backgroundColor: canGoNext ? '#51cf66' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          Siguiente →
        </button>
      </div>

      {/* 🚀 Mostrar información de la API */}
      {isLoading && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeeba',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <div>⏳ Cargando datos desde el servidor...</div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
            Esto puede tomar unos segundos
          </div>
        </div>
      )}

      {apiData && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          <h4>✅ Datos cargados exitosamente:</h4>
          <pre style={{ fontSize: '12px', marginTop: '10px' }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}

      {apiError && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          <h4>❌ Error al cargar datos:</h4>
          <div style={{ color: '#721c24', marginTop: '10px' }}>
            {apiError}
          </div>
        </div>
      )}

      {/* 🚀 Cheat Sheet del patrón .provide() */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <h3>📋 Cheat Sheet: Patrón .provide()</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>🎯 Estructura básica:</strong></p>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`const machineWithImpls = baseMachine.provide({
  actions: { /* implementaciones */ },
  guards: { /* implementaciones */ },
  delays: { /* implementaciones */ },
  actors: { /* implementaciones */ }
});`}
          </pre>
          
          <p><strong>🚀 Con nuestros builders:</strong></p>
          <pre style={{ backgroundColor: '#e9ecef', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`const machine = baseMachine.provide(
  ProvideBuilder.create()
    .withActions(ActionsBuilder.create()...)
    .withGuards(GuardsBuilder.create()...)
    .withDelays(DelaysBuilder.create()...)
    .withActors(ActorsBuilder.create()
      .withFetchData(fetchFunction)
      .build())
    .build()
);`}
          </pre>

          <p><strong>⏱️ Tipos de delays implementados:</strong></p>
          <ul>
            <li><code>.withDelay(name, milliseconds)</code> - Delay fijo</li>
            <li><code>.withDynamicDelay(name, function)</code> - Delay dinámico</li>
            <li><code>.withDelayReference(name, reference)</code> - Referencia a otro delay</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
