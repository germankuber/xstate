// 🧪 Test rápido para debuggear el problema con null
import { GenericStateBuilder } from '../StateBuilder';

describe('Debug null issue', () => {
  it('should debug null vs undefined', () => {
    const builder1 = GenericStateBuilder.create<string>();
    const builder2 = GenericStateBuilder.create<string>();
    
    const result1 = builder1.withOutput(null).build();
    const result2 = builder2.withOutput(undefined).build();
    
    console.log('result1:', JSON.stringify(result1, null, 2));
    console.log('result2:', JSON.stringify(result2, null, 2));
    console.log('result1.output === null:', result1.output === null);
    console.log('result1.output === undefined:', result1.output === undefined);
    console.log('result2.output === undefined:', result2.output === undefined);
    
    // Test correcto
    expect(result1.output).toBe(null);
    expect(result2.output).toBe(undefined);
  });
});
