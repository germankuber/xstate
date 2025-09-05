import { GenericGuardsBuilder } from '../GuardsBuilder';

describe('GenericGuardsBuilder', () => {
  describe('Basic Construction', () => {
    it('should create a guards builder', () => {
      const builder = GenericGuardsBuilder.create();
      expect(builder).toBeInstanceOf(GenericGuardsBuilder);
    });

    it('should build an empty guards object by default', () => {
      const guards = GenericGuardsBuilder.create().build();
      expect(guards).toEqual({});
    });
  });

  describe('Guard Configuration', () => {
    it('should add a single guard', () => {
      const isValidGuard = ({ context }: { context: any }, event: any) => {
        return context.isValid === true;
      };

      const guards = GenericGuardsBuilder
        .create<'isValid', { isValid: boolean }, { type: 'CHECK' }>()
        .withGuard('isValid', isValidGuard)
        .build();
      
      expect(guards.isValid).toBe(isValidGuard);
      expect(typeof guards.isValid).toBe('function');
    });

    it('should add multiple guards', () => {
      const isAuthenticated = ({ context }: { context: any }) => Boolean(context.user);
      const hasPermission = ({ context }: { context: any }) => context.user?.role === 'admin';
      const isOnline = ({ context }: { context: any }) => context.networkStatus === 'online';
      const canSubmit = ({ context }: { context: any }, event: any) => {
        return context.formValid && event.type === 'SUBMIT';
      };

      const guards = GenericGuardsBuilder
        .create<'isAuthenticated' | 'hasPermission' | 'isOnline' | 'canSubmit'>()
        .withGuard('isAuthenticated', isAuthenticated)
        .withGuard('hasPermission', hasPermission)
        .withGuard('isOnline', isOnline)
        .withGuard('canSubmit', canSubmit)
        .build();
      
      expect(guards.isAuthenticated).toBe(isAuthenticated);
      expect(guards.hasPermission).toBe(hasPermission);
      expect(guards.isOnline).toBe(isOnline);
      expect(guards.canSubmit).toBe(canSubmit);
      expect(Object.keys(guards)).toHaveLength(4);
    });

    it('should overwrite existing guard', () => {
      const firstImplementation = ({ context }: { context: any }) => true;
      const secondImplementation = ({ context }: { context: any }) => false;

      const guards = GenericGuardsBuilder
        .create<'testGuard'>()
        .withGuard('testGuard', firstImplementation)
        .withGuard('testGuard', secondImplementation)
        .build();
      
      expect(guards.testGuard).toBe(secondImplementation);
    });
  });

  describe('Guard Function Behaviors', () => {
    it('should handle context-only guards', () => {
      const isLoadingGuard = ({ context }: { context: { isLoading: boolean } }) => {
        return context.isLoading;
      };

      const guards = GenericGuardsBuilder
        .create<'isLoading', { isLoading: boolean }>()
        .withGuard('isLoading', isLoadingGuard)
        .build();
      
      expect(typeof guards.isLoading).toBe('function');
      
      // Test the actual guard logic
      const mockContext = { isLoading: true };
      const result = guards.isLoading({ context: mockContext }, {} as any);
      expect(result).toBe(true);
    });

    it('should handle event-dependent guards', () => {
      const isValidEventGuard = ({ context }: { context: any }, event: { type: string; value?: number }) => {
        return event.type === 'SUBMIT' && (event.value || 0) > 0;
      };

      const guards = GenericGuardsBuilder
        .create<'isValidEvent', any, { type: string; value?: number }>()
        .withGuard('isValidEvent', isValidEventGuard)
        .build();
      
      // Test with valid event
      const validResult = guards.isValidEvent(
        { context: {} }, 
        { type: 'SUBMIT', value: 5 }
      );
      expect(validResult).toBe(true);
      
      // Test with invalid event
      const invalidResult = guards.isValidEvent(
        { context: {} }, 
        { type: 'CANCEL', value: 5 }
      );
      expect(invalidResult).toBe(false);
    });

    it('should handle complex context and event guards', () => {
      interface UserContext {
        user: { id: string; role: string; permissions: string[] } | null;
        currentResource: string;
        attemptCount: number;
      }

      type UserEvent = 
        | { type: 'ACCESS_RESOURCE'; resourceId: string }
        | { type: 'RETRY_ACCESS' };

      const canAccessResourceGuard = (
        { context }: { context: UserContext }, 
        event: UserEvent
      ): boolean => {
        if (!context.user) return false;
        if (context.attemptCount >= 3) return false;
        
        if (event.type === 'ACCESS_RESOURCE') {
          return context.user.permissions.includes('read') || 
                 context.user.role === 'admin';
        }
        
        return event.type === 'RETRY_ACCESS' && context.attemptCount < 3;
      };

      const guards = GenericGuardsBuilder
        .create<'canAccessResource', UserContext, UserEvent>()
        .withGuard('canAccessResource', canAccessResourceGuard)
        .build();
      
      // Test with admin user
      const adminResult = guards.canAccessResource(
        { 
          context: { 
            user: { id: '1', role: 'admin', permissions: [] },
            currentResource: 'doc1',
            attemptCount: 0
          }
        },
        { type: 'ACCESS_RESOURCE', resourceId: 'doc1' }
      );
      expect(adminResult).toBe(true);
      
      // Test with user without permissions
      const noPermResult = guards.canAccessResource(
        { 
          context: { 
            user: { id: '2', role: 'user', permissions: [] },
            currentResource: 'doc1',
            attemptCount: 0
          }
        },
        { type: 'ACCESS_RESOURCE', resourceId: 'doc1' }
      );
      expect(noPermResult).toBe(false);
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const guards = GenericGuardsBuilder
        .create<'isValid' | 'isReady' | 'canProceed' | 'hasData'>()
        .withGuard('isValid', ({ context }: { context: any }) => context.valid)
        .withGuard('isReady', ({ context }: { context: any }) => context.ready)
        .withGuard('canProceed', ({ context }: { context: any }, event: any) => 
          context.valid && context.ready && event.type === 'PROCEED'
        )
        .withGuard('hasData', ({ context }: { context: any }) => 
          Array.isArray(context.data) && context.data.length > 0
        )
        .build();

      expect(Object.keys(guards)).toEqual(['isValid', 'isReady', 'canProceed', 'hasData']);
      expect(typeof guards.isValid).toBe('function');
      expect(typeof guards.isReady).toBe('function');
      expect(typeof guards.canProceed).toBe('function');
      expect(typeof guards.hasData).toBe('function');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for guard names and implementations', () => {
      type TestGuards = 'isAuthenticated' | 'hasPermission' | 'isFormValid' | 'canSubmit';
      type TestContext = { 
        user: { id: string; role: string } | null;
        formData: Record<string, any>;
        isValid: boolean;
      };
      type TestEvent = { type: 'SUBMIT' | 'VALIDATE'; data?: any };
      
      const builder = GenericGuardsBuilder.create<TestGuards, TestContext, TestEvent>();
      
      // These should not cause TypeScript errors in a real TypeScript environment
      const guards = builder
        .withGuard('isAuthenticated', ({ context }: { context: TestContext }) => {
          return Boolean(context.user);
        })
        .withGuard('hasPermission', ({ context }: { context: TestContext }) => {
          return context.user?.role === 'admin';
        })
        .withGuard('isFormValid', ({ context }: { context: TestContext }) => {
          return context.isValid && Object.keys(context.formData).length > 0;
        })
        .withGuard('canSubmit', ({ context }: { context: TestContext }, event: TestEvent) => {
          return context.isValid && event.type === 'SUBMIT';
        })
        .build();

      expect(typeof guards.isAuthenticated).toBe('function');
      expect(typeof guards.hasPermission).toBe('function');
      expect(typeof guards.isFormValid).toBe('function');
      expect(typeof guards.canSubmit).toBe('function');
    });
  });

  describe('Real World Usage Patterns', () => {
    it('should handle typical form validation guards', () => {
      interface FormContext {
        fields: {
          email: string;
          password: string;
          confirmPassword: string;
          terms: boolean;
        };
        errors: Record<string, string[]>;
        touched: Record<string, boolean>;
        submitAttempts: number;
      }

      type FormEvent = 
        | { type: 'FIELD_CHANGE'; field: string; value: any }
        | { type: 'FIELD_BLUR'; field: string }
        | { type: 'SUBMIT' }
        | { type: 'RESET' };

      type FormGuards = 
        | 'isEmailValid'
        | 'isPasswordValid'
        | 'doPasswordsMatch'
        | 'isTermsAccepted'
        | 'canSubmit'
        | 'shouldShowError'
        | 'isRetryAllowed';

      const guards = GenericGuardsBuilder
        .create<FormGuards, FormContext, FormEvent>()
        .withGuard('isEmailValid', ({ context }: { context: FormContext }) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(context.fields.email);
        })
        .withGuard('isPasswordValid', ({ context }: { context: FormContext }) => {
          return context.fields.password.length >= 8;
        })
        .withGuard('doPasswordsMatch', ({ context }: { context: FormContext }) => {
          return context.fields.password === context.fields.confirmPassword;
        })
        .withGuard('isTermsAccepted', ({ context }: { context: FormContext }) => {
          return context.fields.terms === true;
        })
        .withGuard('canSubmit', ({ context }: { context: FormContext }) => {
          return Object.keys(context.errors).length === 0 && 
                 context.fields.email && 
                 context.fields.password && 
                 context.fields.terms;
        })
        .withGuard('shouldShowError', ({ context }: { context: FormContext }, event: FormEvent) => {
          if (event.type === 'FIELD_BLUR') {
            return context.touched[event.field] || context.submitAttempts > 0;
          }
          return context.submitAttempts > 0;
        })
        .withGuard('isRetryAllowed', ({ context }: { context: FormContext }) => {
          return context.submitAttempts < 3;
        })
        .build();

      // Verify all guards are present
      expect(Object.keys(guards)).toHaveLength(7);
      
      // Test email validation
      const emailResult = guards.isEmailValid({
        context: {
          fields: { email: 'test@example.com', password: '', confirmPassword: '', terms: false },
          errors: {},
          touched: {},
          submitAttempts: 0
        }
      }, { type: 'SUBMIT' });
      expect(emailResult).toBe(true);
      
      // Test invalid email
      const invalidEmailResult = guards.isEmailValid({
        context: {
          fields: { email: 'invalid-email', password: '', confirmPassword: '', terms: false },
          errors: {},
          touched: {},
          submitAttempts: 0
        }
      }, { type: 'SUBMIT' });
      expect(invalidEmailResult).toBe(false);
    });

    it('should handle authentication and authorization guards', () => {
      interface AppContext {
        user: {
          id: string;
          role: 'guest' | 'user' | 'admin' | 'superadmin';
          permissions: string[];
          sessionExpiry: number;
        } | null;
        currentPage: string;
        lastActivity: number;
      }

      type AppEvent = 
        | { type: 'NAVIGATE'; page: string }
        | { type: 'ACCESS_FEATURE'; feature: string }
        | { type: 'ADMIN_ACTION'; action: string };

      const guards = GenericGuardsBuilder
        .create<'isLoggedIn' | 'isAdmin' | 'hasValidSession' | 'canAccessPage' | 'hasFeaturePermission'>()
        .withGuard('isLoggedIn', ({ context }: { context: AppContext }) => {
          return Boolean(context.user);
        })
        .withGuard('isAdmin', ({ context }: { context: AppContext }) => {
          return context.user?.role === 'admin' || context.user?.role === 'superadmin';
        })
        .withGuard('hasValidSession', ({ context }: { context: AppContext }) => {
          if (!context.user) return false;
          return Date.now() < context.user.sessionExpiry;
        })
        .withGuard('canAccessPage', ({ context }: { context: AppContext }, event: AppEvent) => {
          if (event.type !== 'NAVIGATE') return false;
          
          const protectedPages = ['admin', 'settings', 'billing'];
          if (!protectedPages.includes(event.page)) return true;
          
          return Boolean(context.user) && context.user.role !== 'guest';
        })
        .withGuard('hasFeaturePermission', ({ context }: { context: AppContext }, event: AppEvent) => {
          if (event.type !== 'ACCESS_FEATURE') return false;
          if (!context.user) return false;
          
          return context.user.permissions.includes(event.feature) ||
                 context.user.role === 'admin' ||
                 context.user.role === 'superadmin';
        })
        .build();

      // Test authentication
      const loggedInResult = guards.isLoggedIn({
        context: {
          user: { id: '1', role: 'user', permissions: [], sessionExpiry: Date.now() + 3600000 },
          currentPage: 'home',
          lastActivity: Date.now()
        }
      }, { type: 'NAVIGATE', page: 'home' });
      expect(loggedInResult).toBe(true);
      
      // Test page access
      const adminPageResult = guards.canAccessPage({
        context: {
          user: { id: '1', role: 'user', permissions: [], sessionExpiry: Date.now() + 3600000 },
          currentPage: 'home',
          lastActivity: Date.now()
        }
      }, { type: 'NAVIGATE', page: 'admin' });
      expect(adminPageResult).toBe(true); // user role can access admin pages
    });
  });

  describe('Edge Cases', () => {
    it('should handle guards that always return true', () => {
      const alwaysTrue = ({ context }: { context: any }, event: any) => true;

      const guards = GenericGuardsBuilder
        .create<'alwaysAllow'>()
        .withGuard('alwaysAllow', alwaysTrue)
        .build();
      
      const result = guards.alwaysAllow({ context: {} }, { type: 'ANY' });
      expect(result).toBe(true);
    });

    it('should handle guards that always return false', () => {
      const alwaysFalse = ({ context }: { context: any }, event: any) => false;

      const guards = GenericGuardsBuilder
        .create<'alwaysDeny'>()
        .withGuard('alwaysDeny', alwaysFalse)
        .build();
      
      const result = guards.alwaysDeny({ context: {} }, { type: 'ANY' });
      expect(result).toBe(false);
    });

    it('should handle guards with complex boolean logic', () => {
      const complexGuard = ({ context }: { context: any }, event: any) => {
        return (context.a && context.b) || (context.c && !context.d) || 
               (event.type === 'SPECIAL' && context.special);
      };

      const guards = GenericGuardsBuilder
        .create<'complex'>()
        .withGuard('complex', complexGuard)
        .build();
      
      // Test different combinations
      const result1 = guards.complex(
        { context: { a: true, b: true, c: false, d: true, special: false } },
        { type: 'NORMAL' }
      );
      expect(result1).toBe(true);
      
      const result2 = guards.complex(
        { context: { a: false, b: false, c: true, d: false, special: false } },
        { type: 'NORMAL' }
      );
      expect(result2).toBe(true);
      
      const result3 = guards.complex(
        { context: { a: false, b: false, c: false, d: true, special: true } },
        { type: 'SPECIAL' }
      );
      expect(result3).toBe(true);
    });
  });
});
