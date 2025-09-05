// 🧪 Tests para funcionalidades de Tags, Meta, Description y Output en StateBuilder
import { GenericStateBuilder } from '../StateBuilder';

describe('StateBuilder - Tags, Meta, Description & Output Features', () => {
  let builder: GenericStateBuilder<string>;

  beforeEach(() => {
    builder = GenericStateBuilder.create<string>();
  });

  describe('🏷️ Tags Support', () => {
    it('should add a single tag', () => {
      const result = builder.withTag('loading').build();
      
      expect(result.tags).toEqual(['loading']);
    });

    it('should add multiple tags using withTag', () => {
      const result = builder
        .withTag('loading')
        .withTag('visible')
        .build();
      
      expect(result.tags).toEqual(['loading', 'visible']);
    });

    it('should add multiple tags using withTags', () => {
      const result = builder
        .withTags('loading', 'visible', 'critical')
        .build();
      
      expect(result.tags).toEqual(['loading', 'visible', 'critical']);
    });

    it('should combine withTag and withTags', () => {
      const result = builder
        .withTag('initial')
        .withTags('loading', 'visible')
        .withTag('final')
        .build();
      
      expect(result.tags).toEqual(['initial', 'loading', 'visible', 'final']);
    });

    it('should handle empty tags', () => {
      const result = builder.withTags().build();
      
      expect(result.tags).toEqual([]);
    });
  });

  describe('📝 Meta Support', () => {
    it('should add meta data', () => {
      const meta = { view: 'shortForm', priority: 'high' };
      const result = builder.withMeta(meta).build();
      
      expect(result.meta).toEqual(meta);
    });

    it('should merge multiple meta objects', () => {
      const result = builder
        .withMeta({ view: 'shortForm' })
        .withMeta({ priority: 'high' })
        .build();
      
      expect(result.meta).toEqual({
        view: 'shortForm',
        priority: 'high'
      });
    });

    it('should override meta properties when duplicated', () => {
      const result = builder
        .withMeta({ priority: 'low' })
        .withMeta({ priority: 'high' })
        .build();
      
      expect(result.meta).toEqual({ priority: 'high' });
    });

    it('should handle complex meta objects', () => {
      const meta = {
        ui: {
          color: 'blue',
          size: 'large'
        },
        validation: {
          required: true,
          min: 0
        }
      };
      const result = builder.withMeta(meta).build();
      
      expect(result.meta).toEqual(meta);
    });
  });

  describe('📝 Description Support', () => {
    it('should add description', () => {
      const description = 'This state handles user authentication';
      const result = builder.withDescription(description).build();
      
      expect(result.description).toBe(description);
    });

    it('should override previous description', () => {
      const result = builder
        .withDescription('First description')
        .withDescription('Second description')
        .build();
      
      expect(result.description).toBe('Second description');
    });

    it('should handle multiline descriptions', () => {
      const description = `This state performs the following:
      1. Validates user input
      2. Makes API call
      3. Updates context`;
      const result = builder.withDescription(description).build();
      
      expect(result.description).toBe(description);
    });
  });

  describe('📤 Output Support', () => {
    it('should add output data', () => {
      const output = { result: 'success', data: [1, 2, 3] };
      const result = builder.withOutput(output).build();
      
      expect(result.output).toEqual(output);
    });

    it('should create final state with output', () => {
      const output = { status: 'completed', value: 42 };
      const result = builder.asFinalStateWithOutput(output).build();
      
      expect(result.type).toBe('final');
      expect(result.output).toEqual(output);
    });

    it('should handle primitive output values', () => {
      const result = builder.withOutput('simple string').build();
      
      expect(result.output).toBe('simple string');
    });

    it('should handle null/undefined output', () => {
      const builder1 = GenericStateBuilder.create<string>();
      const builder2 = GenericStateBuilder.create<string>();
      
      const result1 = builder1.withOutput(null).build();
      const result2 = builder2.withOutput(undefined).build();
      
      expect(result1.output).toBe(null);
      expect(result2.output).toBe(undefined);
    });
  });

  describe('🔄 Combined Features', () => {
    it('should combine tags, meta, description, and output', () => {
      const result = builder
        .withTag('loading')
        .withTags('visible', 'critical')
        .withMeta({ view: 'shortForm', priority: 'high' })
        .withDescription('Complex state with multiple features')
        .withOutput({ result: 'success' })
        .build();
      
      expect(result).toEqual({
        tags: ['loading', 'visible', 'critical'],
        meta: { view: 'shortForm', priority: 'high' },
        description: 'Complex state with multiple features',
        output: { result: 'success' }
      });
    });

    it('should work with existing entry/exit actions', () => {
      const result = builder
        .withEntry('enterAction')
        .withExit('exitAction')
        .withTag('interactive')
        .withMeta({ component: 'button' })
        .build();
      
      expect(result).toEqual({
        entry: ['enterAction'],
        exit: ['exitAction'],
        tags: ['interactive'],
        meta: { component: 'button' }
      });
    });

    it('should work with transitions and invoke', () => {
      const transitions = { NEXT: { target: 'nextState' } };
      const invoke = { src: 'someService' };
      
      const result = builder
        .withTransitions(transitions)
        .withInvoke(invoke)
        .withTag('async')
        .withDescription('State with async operations')
        .build();
      
      expect(result).toEqual({
        on: transitions,
        invoke: invoke,
        tags: ['async'],
        description: 'State with async operations'
      });
    });
  });
});
