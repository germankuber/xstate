import { useMachine } from '@xstate/react';
import { assign, createMachine, fromPromise } from 'xstate';

// Función simple para probar
const testFetch = async () => {
  console.log('🔥 [SIMPLE_TEST] testFetch INICIADO!');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('✅ [SIMPLE_TEST] testFetch COMPLETADO!');
  return { data: 'test' };
};

// Actor de promesa para XState v5
const testFetchActor = fromPromise(testFetch);

// Máquina XState pura sin builders
const simpleMachine = createMachine({
  id: 'simpleTest',
  initial: 'idle',
  context: {
    data: null,
    error: null
  },
  states: {
    idle: {
      on: {
        START: 'loading'
      }
    },
    loading: {
      entry: () => console.log('🚪 [SIMPLE_TEST] Entrando a loading'),
      invoke: {
        src: testFetchActor,
        id: 'testFetchActor',
        onDone: {
          target: 'success',
          actions: assign({
            data: ({ event }) => {
              console.log('✅ [SIMPLE_TEST] onDone ejecutado:', event.output);
              return event.output;
            }
          })
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => {
              console.log('❌ [SIMPLE_TEST] onError ejecutado:', event.error);
              return event.error;
            }
          })
        }
      }
    },
    success: {
      entry: () => console.log('🎉 [SIMPLE_TEST] SUCCESS!')
    },
    error: {
      entry: () => console.log('💥 [SIMPLE_TEST] ERROR!')
    }
  }
});

export const SimpleTest = () => {
  const [state, send] = useMachine(simpleMachine);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h2>🧪 Simple XState Invoke Test</h2>
      <p>Estado actual: <strong>{state.value as string}</strong></p>
      <button 
        onClick={() => send({ type: 'START' })}
        disabled={!state.matches('idle')}
      >
        Iniciar Test
      </button>
      
      {state.context.data && (
        <p>✅ Datos: {JSON.stringify(state.context.data)}</p>
      )}
      
      {state.context.error && (
        <p>❌ Error: {state.context.error}</p>
      )}
    </div>
  );
};
