import { useMachine } from '@xstate/react';
import { assign } from 'xstate';
import {
    ActionsBuilder,
    GuardsBuilder,
    MachineBuilder,
    StateBuilder,
    StatesBuilder,
    StepAction,
    StepBuilder,
    StepEvent,
    StepGuard,
    StepperContext,
    StepperEvent,
    StepState,
    TransitionBuilder
} from './stepper/types';

// 🎯 Definiciones usando StepBuilder Pattern (súper fluido y elegante)
const STEP1_TRANSITIONS = StepBuilder.create(StepState.STEP1)
  .withTransitionDefinition(
    StepEvent.NEXT,
    TransitionBuilder.create()
      .to(StepState.STEP2)
      .withActions(
        StepAction.LOG_TRANSITION, 
        StepAction.RISKY_ACTION,
        StepAction.AFTER_RISKY_ACTION,
        StepAction.NOTIFY_STEP_CHANGE
      )
      .guardedBy(StepGuard.CAN_GO_NEXT)
      .describedAs('🚀 Inicio del flujo - primer paso')
      .build()
  )
  .build();

const STEP2_TRANSITIONS = StepBuilder.create(StepState.STEP2)
  .withTransitionDefinition(
    StepEvent.NEXT,
    TransitionBuilder.create()
      .to(StepState.STEP3)
      .withActions(StepAction.LOG_TRANSITION, StepAction.NOTIFY_STEP_CHANGE, StepAction.TRACK_ANALYTICS)
      .guardedBy(StepGuard.CAN_GO_NEXT)
      .describedAs('⏭️ Avance al paso intermedio')
      .build()
  )
  .withTransitionDefinition(
    StepEvent.PREV,
    TransitionBuilder.create()
      .to(StepState.STEP1)
      .withActions(StepAction.LOG_TRANSITION, StepAction.NOTIFY_STEP_CHANGE)
      .guardedBy(StepGuard.CAN_GO_PREV)
      .describedAs('⏪ Retroceso al inicio')
      .build()
  )
  .build();

const STEP3_TRANSITIONS = StepBuilder.create(StepState.STEP3)
  .withTransitionDefinition(
    StepEvent.NEXT,
    // Camino del éxito
    TransitionBuilder.create()
      .to(StepState.STEP4)
      .withActions(
        StepAction.SUCCESS_PATH_ACTION,
        StepAction.LOG_TRANSITION, 
        StepAction.NOTIFY_STEP_CHANGE, 
        StepAction.TRACK_ANALYTICS
      )
      .guardedBy(StepGuard.HAS_VALID_DATA)
      .describedAs('✅ Validación exitosa - avanza a paso final')
      .build(),
    // Camino del fallo
    TransitionBuilder.create()
      .withActions(
        StepAction.FAILURE_PATH_ACTION,
        StepAction.ON_GUARD_FAIL, 
        StepAction.ON_VALIDATION_ERROR, 
        StepAction.INCREMENT_ERROR_COUNT
      )
      .describedAs('❌ Validación falló - manejo de error sin transición')
      .build()
  )
  .withTransitionDefinition(
    StepEvent.PREV,
    TransitionBuilder.create()
      .to(StepState.STEP2)
      .withActions(StepAction.LOG_TRANSITION, StepAction.NOTIFY_STEP_CHANGE)
      .guardedBy(StepGuard.CAN_GO_PREV)
      .describedAs('⬅️ Retroceso seguro al paso anterior')
      .build()
  )
  .build();

const STEP4_TRANSITIONS = StepBuilder.create(StepState.STEP4)
  .withTransitionDefinition(
    StepEvent.PREV,
    TransitionBuilder.create()
      .to(StepState.STEP3)
      .withActions(StepAction.LOG_TRANSITION, StepAction.NOTIFY_STEP_CHANGE)
      .guardedBy(StepGuard.CAN_GO_PREV)
      .describedAs('🔙 Retorno desde el paso final')
      .build()
  )
  .build();

const stepperMachine = MachineBuilder.create('stepper')
  .withInitialState(StepState.STEP1)
  .withTypes<StepperContext, StepperEvent>()
  .withContext({
    currentStepName: 'Inicio',
    visitedSteps: ['Inicio'],
    stepCount: 1,
    errorCount: 0,
    lastError: undefined
  } as StepperContext)
  .withStates(
    StatesBuilder.create()
      .withState(
        StepState.STEP1,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP, StepAction.SET_STEP1_NAME)
          .withExit(StepAction.ON_EXIT_STEP)
          .withTransitions(STEP1_TRANSITIONS)
          .build()
      )
      .withState(
        StepState.STEP2,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP, StepAction.SET_STEP2_NAME, StepAction.ADD_VISITED_STEP)
          .withExit(StepAction.ON_EXIT_STEP)
          .withTransitions(STEP2_TRANSITIONS)
          .build()
      )
      .withState(
        StepState.STEP3,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP, StepAction.SET_STEP3_NAME, StepAction.ADD_VISITED_STEP)
          .withExit(StepAction.ON_EXIT_STEP)
          .withTransitions(STEP3_TRANSITIONS)
          .build()
      )
      .withState(
        StepState.STEP4,
        StateBuilder.create()
          .withEntry(StepAction.ON_ENTER_STEP, StepAction.SET_STEP4_NAME, StepAction.ADD_VISITED_STEP)
          .withExit(StepAction.ON_EXIT_STEP)
          .withTransitions(STEP4_TRANSITIONS)
          .build()
      )
      .build()
  )
  .withActions(
    ActionsBuilder.create()
      .withAction(StepAction.LOG_TRANSITION, ({ context }, event) => {
        console.log('3️⃣ [TRANSICIÓN] Ejecutando durante la transición:', { 
          from: context, 
          eventType: (event as StepperEvent)?.type || 'unknown',
          currentStepName: context.currentStepName,
          timestamp: Date.now()
        });
      })
      .withAction(StepAction.NOTIFY_STEP_CHANGE, ({ context }, event) => {
        console.log('4️⃣ [TRANSICIÓN] Cambio de paso detectado:', {
          eventType: (event as StepperEvent)?.type || 'unknown',
          currentStep: context.currentStepName,
          stepCount: context.stepCount
        });
      })
      .withAction(StepAction.TRACK_ANALYTICS, ({ context }, event) => {
        console.log('📊 [TRANSICIÓN] Enviando evento de analytics:', { 
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown',
          visitedSteps: context.visitedSteps.length,
          timestamp: new Date().toISOString() 
        });
      })
      .withAction(StepAction.ON_ENTER_STEP, ({ context }, event) => {
        console.log('5️⃣ [ENTRADA] 🚪 ENTRANDO al nuevo estado:', {
          stepName: context.currentStepName,
          stepCount: context.stepCount,
          timestamp: Date.now()
        });
      })
      .withAction(StepAction.ON_EXIT_STEP, ({ context }, event) => {
        console.log('2️⃣ [SALIDA] 🚪 SALIENDO del estado actual:', {
          currentStepName: context.currentStepName,
          visitedSteps: context.visitedSteps,
          timestamp: Date.now()
        });
      })
      .withAction(StepAction.RISKY_ACTION, ({ context }, event) => {
        console.log('⚠️  [ACCIÓN 2] Ejecutando acción riesgosa...', {
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
        
        // Simular que a veces falla
        const shouldFail = Math.random() > 0.5; // 50% probabilidad de fallo
      })
      .withAction(StepAction.AFTER_RISKY_ACTION, ({ context }, event) => {
        console.log('🎯 [ACCIÓN 3] Esta acción se ejecuta después de la riesgosa', {
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
      })
      .withAssignAction(StepAction.SET_STEP1_NAME, assign(({ context }) => {
        console.log('📝 [CONTEXT] Actualizando currentStepName a: Inicio');
        return {
          currentStepName: 'Inicio'
        };
      }))
      .withAssignAction(StepAction.SET_STEP2_NAME, assign(({ context }) => {
        console.log('📝 [CONTEXT] Actualizando currentStepName a: Configuración');
        return {
          currentStepName: 'Configuración'
        };
      }))
      .withAssignAction(StepAction.SET_STEP3_NAME, assign(({ context }) => {
        console.log('📝 [CONTEXT] Actualizando currentStepName a: Revisión');
        return {
          currentStepName: 'Revisión'
        };
      }))
      .withAssignAction(StepAction.SET_STEP4_NAME, assign(({ context }) => {
        console.log('📝 [CONTEXT] Actualizando currentStepName a: Finalización');
        return {
          currentStepName: 'Finalización'
        };
      }))
      .withAssignAction(StepAction.ADD_VISITED_STEP, assign(({ context }) => {
        const newStep = context.currentStepName;
        if (!context.visitedSteps.includes(newStep)) {
          console.log('📋 [CONTEXT] Agregando paso visitado:', newStep);
          return {
            visitedSteps: [...context.visitedSteps, newStep],
            stepCount: context.stepCount + 1
          };
        }
        return {};
      }))
      .withAction(StepAction.ON_GUARD_FAIL, ({ context }, event) => {
        console.log('❌ [GUARD FAIL] Una guarda falló:', {
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown',
          errorCount: context.errorCount
        });
      })
      .withAssignAction(StepAction.ON_VALIDATION_ERROR, assign(({ context }, event) => {
        const errorMessage = `Validación falló en ${context.currentStepName} con evento ${(event as StepperEvent)?.type}`;
        console.log('🚫 [VALIDATION ERROR] Error de validación:', errorMessage);
        return {
          lastError: errorMessage
        };
      }))
      .withAssignAction(StepAction.INCREMENT_ERROR_COUNT, assign(({ context }) => {
        console.log('📈 [ERROR COUNT] Incrementando contador de errores');
        return {
          errorCount: context.errorCount + 1
        };
      }))
      .withAction(StepAction.SUCCESS_PATH_ACTION, ({ context }, event) => {
        console.log('🎉 [SUCCESS PATH] 🟢 CAMINO DEL ÉXITO - La guarda PASÓ!', {
          message: '✅ Vamos al Step 4',
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
      })
      .withAction(StepAction.FAILURE_PATH_ACTION, ({ context }, event) => {
        console.log('💥 [FAILURE PATH] 🔴 CAMINO DEL FALLO - La guarda FALLÓ!', {
          message: '❌ Nos quedamos en Step 3',
          currentStep: context.currentStepName,
          eventType: (event as StepperEvent)?.type || 'unknown',
          errorCount: context.errorCount
        });
      })
      .build()
  )
  .withGuards(
    GuardsBuilder.create()
      .withGuard(StepGuard.CAN_GO_NEXT, ({ context }, event) => {
        console.log('1️⃣ [GUARDA] ✅ Verificando si puede avanzar', {
          currentStep: context.currentStepName,
          stepCount: context.stepCount,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
        return true; // Siempre permitir por ahora
      })
      .withGuard(StepGuard.CAN_GO_PREV, ({ context }, event) => {
        console.log('1️⃣ [GUARDA] ✅ Verificando si puede retroceder', {
          currentStep: context.currentStepName,
          visitedSteps: context.visitedSteps.length,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
        return true; // Siempre permitir por ahora
      })
      .withGuard(StepGuard.HAS_VALID_DATA, ({ context }, event) => {
        console.log('1️⃣ [GUARDA] 🔍 Verificando si los datos son válidos antes de proceder', {
          currentStep: context.currentStepName,
          stepCount: context.stepCount,
          eventType: (event as StepperEvent)?.type || 'unknown'
        });
        
        // 🧪 50% probabilidad para que sea más fácil de probar
        const isValid = Math.random() > 0.5; // 50% éxito, 50% fallo
        
        if (isValid) {
          console.log('✅ [GUARDA RESULTADO] Datos válidos - EJECUTARÁ OPCIÓN 1 (SUCCESS)', {
            currentStepName: context.currentStepName,
            visitedStepsCount: context.visitedSteps.length
          });
        } else {
          console.log('❌ [GUARDA RESULTADO] Datos inválidos - EJECUTARÁ OPCIÓN 2 (FAILURE)', {
            currentStepName: context.currentStepName,
            visitedStepsCount: context.visitedSteps.length
          });
        }
        
        return isValid;
      })
      .build()
  )
  .build();

const getStepInfo = (currentStep: string) => {
  const steps = {
    [StepState.STEP1]: { number: 1, title: 'Inicio', description: 'Primer paso del proceso' },
    [StepState.STEP2]: { number: 2, title: 'Configuración', description: 'Configura tus preferencias' },
    [StepState.STEP3]: { number: 3, title: 'Revisión', description: 'Revisa la información ingresada' },
    [StepState.STEP4]: { number: 4, title: 'Finalización', description: 'Proceso completado' }
  };
  return steps[currentStep as StepState];
};

export const Toggler = () => {
  const [state, send] = useMachine(stepperMachine);
  const currentStepInfo = getStepInfo(state.value as string);
  
  const canGoNext = !state.matches(StepState.STEP4);
  const canGoPrev = !state.matches(StepState.STEP1);

  // 🎯 Acceso al context
  const { currentStepName, visitedSteps, stepCount, errorCount, lastError } = state.context;

  // 🧪 Para demostrar que React re-renderiza automáticamente
  console.log('🔄 [REACT] Componente re-renderizando. Estado actual:', state.value);
  const renderTime = new Date().toLocaleTimeString();

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007acc', 
      borderRadius: '8px', 
      maxWidth: '400px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h3>Proceso por Pasos</h3>
      
      {/* 🧪 Info de debugging */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <p><strong>🔄 Último render:</strong> {renderTime}</p>
        <p><strong>📍 Estado XState:</strong> {String(state.value)}</p>
        <p><strong>📝 Nombre del paso (context):</strong> {currentStepName}</p>
        <p><strong>🔢 Contador de pasos:</strong> {stepCount}</p>
        <p><strong>📋 Pasos visitados:</strong> {visitedSteps.join(' → ')}</p>
        <p><strong>🚨 Errores de guardas:</strong> {errorCount}</p>
        {lastError && (
          <p style={{ color: 'red', fontSize: '11px' }}>
            <strong>💥 Último error:</strong> {lastError}
          </p>
        )}
        <p><strong>▶️ Puede avanzar:</strong> {canGoNext ? '✅' : '❌'}</p>
        <p><strong>◀️ Puede retroceder:</strong> {canGoPrev ? '✅' : '❌'}</p>
      </div>
      
      {/* Indicador de progreso */}
      <div style={{ margin: '20px 0' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '10px' 
        }}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentStepInfo.number >= step ? '#007acc' : '#e0e0e0',
                color: currentStepInfo.number >= step ? 'white' : '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              {step}
            </div>
          ))}
        </div>
        <div style={{ 
          height: '4px', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#007acc',
            width: `${((currentStepInfo.number - 1) / 3) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Información del paso actual */}
      <div style={{ margin: '20px 0' }}>
        <h4 style={{ margin: '10px 0', color: '#007acc' }}>
          Paso {currentStepInfo.number}: {currentStepInfo.title}
        </h4>
        <p style={{ margin: '10px 0', color: '#666' }}>
          {currentStepInfo.description}
        </p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Estado actual: <strong>{String(state.value)}</strong>
        </p>
      </div>

      {/* Botones de navegación */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
    </div>
  );
};
