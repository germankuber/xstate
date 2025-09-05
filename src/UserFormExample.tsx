import { useMachine } from '@xstate/react';
import { assign, createMachine } from 'xstate';

// Tipos para el context
interface UserFormContext {
  userData: {
    name: string;
    email: string;
    age: number;
  };
  errors: string[];
  attemptCount: number;
  isOnline: boolean;
}

// Estados del flujo
enum FormState {
  IDLE = 'idle',
  EDITING = 'editing', 
  VALIDATING = 'validating',
  SAVING = 'saving',
  SUCCESS = 'success',
  ERROR = 'error'
}

// Eventos
enum FormEvent {
  START_EDIT = 'START_EDIT',
  UPDATE_FIELD = 'UPDATE_FIELD',
  SUBMIT = 'SUBMIT',
  RETRY = 'RETRY',
  RESET = 'RESET'
}

// Acciones
enum FormAction {
  UPDATE_USER_DATA = 'updateUserData',
  ADD_ERROR = 'addError',
  CLEAR_ERRORS = 'clearErrors',
  INCREMENT_ATTEMPTS = 'incrementAttempts',
  RESET_FORM = 'resetForm'
}

const userFormMachine = createMachine({
  id: 'userForm',
  initial: FormState.IDLE,
  // 🎯 AQUÍ van los datos que antes tenías en useState
  context: {
    userData: {
      name: '',
      email: '',
      age: 0
    },
    errors: [],
    attemptCount: 0,
    isOnline: true
  } as UserFormContext,
  
  // 🎯 AQUÍ van los estados de flujo que antes tenías en useState
  states: {
    [FormState.IDLE]: {
      on: {
        [FormEvent.START_EDIT]: FormState.EDITING
      }
    },
    
    [FormState.EDITING]: {
      on: {
        [FormEvent.UPDATE_FIELD]: {
          actions: [FormAction.UPDATE_USER_DATA]
        },
        [FormEvent.SUBMIT]: {
          target: FormState.VALIDATING,
          actions: [FormAction.CLEAR_ERRORS]
        }
      }
    },
    
    [FormState.VALIDATING]: {
      after: {
        1000: [
          {
            target: FormState.SAVING,
            guard: 'isFormValid'
          },
          {
            target: FormState.ERROR,
            actions: [FormAction.ADD_ERROR]
          }
        ]
      }
    },
    
    [FormState.SAVING]: {
      after: {
        2000: [
          {
            target: FormState.SUCCESS,
            guard: 'saveSuccessful'
          },
          {
            target: FormState.ERROR,
            actions: [FormAction.ADD_ERROR, FormAction.INCREMENT_ATTEMPTS]
          }
        ]
      }
    },
    
    [FormState.SUCCESS]: {
      on: {
        [FormEvent.RESET]: {
          target: FormState.IDLE,
          actions: [FormAction.RESET_FORM]
        }
      }
    },
    
    [FormState.ERROR]: {
      on: {
        [FormEvent.RETRY]: FormState.VALIDATING,
        [FormEvent.RESET]: {
          target: FormState.IDLE,
          actions: [FormAction.RESET_FORM]
        }
      }
    }
  }
}, {
  // 🎯 AQUÍ defines cómo actualizar el context (como setters de useState)
  actions: {
    [FormAction.UPDATE_USER_DATA]: assign(({ context }, event: any) => ({
      userData: {
        ...context.userData,
        [event.field]: event.value
      }
    })),
    
    [FormAction.ADD_ERROR]: assign(({ context }) => ({
      errors: [
        ...context.errors,
        'Error de validación detectado'
      ]
    })),
    
    [FormAction.CLEAR_ERRORS]: assign({
      errors: []
    }),
    
    [FormAction.INCREMENT_ATTEMPTS]: assign(({ context }) => ({
      attemptCount: context.attemptCount + 1
    })),
    
    [FormAction.RESET_FORM]: assign({
      userData: { name: '', email: '', age: 0 },
      errors: [],
      attemptCount: 0
    })
  },
  
  guards: {
    isFormValid: ({ context }) => {
      return context.userData.name.length > 0 && 
             context.userData.email.includes('@');
    },
    saveSuccessful: () => Math.random() > 0.3 // 70% éxito
  }
});

export const UserFormExample = () => {
  const [state, send] = useMachine(userFormMachine);
  
  // 🎯 Acceso a los datos (antes useState)
  const { userData, errors, attemptCount } = state.context;
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px' }}>
      <h3>Formulario de Usuario (XState)</h3>
      
      {/* Estado actual */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <p><strong>Estado:</strong> {String(state.value)}</p>
        <p><strong>Intentos:</strong> {attemptCount}</p>
        <p><strong>Errores:</strong> {errors.length}</p>
      </div>
      
      {/* Formulario */}
      {state.matches(FormState.EDITING) && (
        <div>
          <input
            placeholder="Nombre"
            value={userData.name}
            onChange={(e) => send({ 
              type: FormEvent.UPDATE_FIELD, 
              field: 'name', 
              value: e.target.value 
            })}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
          />
          <input
            placeholder="Email"
            value={userData.email}
            onChange={(e) => send({ 
              type: FormEvent.UPDATE_FIELD, 
              field: 'email', 
              value: e.target.value 
            })}
            style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }}
          />
          <button 
            onClick={() => send({ type: FormEvent.SUBMIT })}
            style={{ padding: '10px 20px', backgroundColor: '#007acc', color: 'white', border: 'none' }}
          >
            Guardar
          </button>
        </div>
      )}
      
      {/* Botones según estado */}
      {state.matches(FormState.IDLE) && (
        <button onClick={() => send({ type: FormEvent.START_EDIT })}>
          Comenzar Edición
        </button>
      )}
      
      {state.matches(FormState.VALIDATING) && <p>⏳ Validando...</p>}
      {state.matches(FormState.SAVING) && <p>💾 Guardando...</p>}
      
      {state.matches(FormState.SUCCESS) && (
        <div>
          <p>✅ ¡Guardado exitoso!</p>
          <button onClick={() => send({ type: FormEvent.RESET })}>Nuevo</button>
        </div>
      )}
      
      {state.matches(FormState.ERROR) && (
        <div>
          <p>❌ Error al guardar</p>
          <button onClick={() => send({ type: FormEvent.RETRY })}>Reintentar</button>
          <button onClick={() => send({ type: FormEvent.RESET })}>Resetear</button>
        </div>
      )}
      
      {/* Debug info */}
      <details style={{ marginTop: '20px' }}>
        <summary>Debug Info</summary>
        <pre>{JSON.stringify({ userData, errors, attemptCount }, null, 2)}</pre>
      </details>
    </div>
  );
};
