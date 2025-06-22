
# Developer Guide

## Development Environment Setup

### Prerequisites
- Node.js 18+
- yarn
- Git
- Modern browser with DevTools

### Project Structure
```
src/
├── components/          # React components
│   ├── ai/             # AI-specific components
│   ├── auth/           # Authentication components
│   ├── business/       # Business-related components
│   ├── realtime/       # Real-time features
│   └── ui/             # UI components (shadcn)
├── hooks/              # Custom React hooks
├── services/           # Business logic and API calls
│   ├── mcp/           # Multi-agent system
│   ├── analytics/     # Analytics services
│   └── cache/         # Caching services
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── integrations/       # External service integrations
```

### Key Technologies

**Frontend Stack:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/UI for components
- React Query for data fetching

**Backend Services:**
- Supabase (PostgreSQL + Auth + Real-time)
- Edge Functions for serverless compute
- Row Level Security (RLS) for data access

**AI/ML Stack:**
- Google AI (Gemini) for language processing
- Custom agent system (MCP)
- Semantic search capabilities

## Component Development

### Creating New Components

**Basic Component Template:**
```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children?: React.ReactNode;
  // Add specific props here
}

const MyComponent: React.FC<MyComponentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {children}
    </div>
  );
};

export default MyComponent;
```

**Component Best Practices:**
1. Use TypeScript for all components
2. Define clear prop interfaces
3. Use `cn()` utility for className merging
4. Follow shadcn/ui patterns
5. Keep components focused and small
6. Use composition over inheritance

### Styling Guidelines

**Tailwind CSS Usage:**
```typescript
// Good - semantic classes
<div className="bg-gray-900 text-white p-6 rounded-lg">

// Better - responsive design
<div className="bg-gray-900 text-white p-4 md:p-6 rounded-lg">

// Best - with conditional classes
<div className={cn(
  "bg-gray-900 text-white p-4 md:p-6 rounded-lg",
  isActive && "ring-2 ring-blue-500",
  className
)}>
```

**Color Palette:**
- Primary: `#00C2FF` (cyan-400)
- Background: Gray scale (900, 800, 700)
- Text: White, gray-300, gray-400
- Accent: Purple, green, yellow variants

## State Management

### React Query for Server State
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query example
export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });
};

// Mutation example
export const useCreateBusiness = () => {
  return useMutation({
    mutationFn: async (business: CreateBusinessData) => {
      const { data, error } = await supabase
        .from('businesses')
        .insert(business)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};
```

### Local State with useState/useReducer
```typescript
// Simple state
const [isLoading, setIsLoading] = useState(false);

// Complex state with useReducer
interface State {
  data: any[];
  loading: boolean;
  error: string | null;
}

type Action = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: any[] }
  | { type: 'ERROR'; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
```

## AI Agent Development

### Creating New Agents

**Agent Base Structure:**
```typescript
import { mcpContextManager, MCPContext } from './MCPContextManager';
import { mcpEventBus } from './MCPEventBus';

class MyAgent {
  private static instance: MyAgent;

  static getInstance(): MyAgent {
    if (!MyAgent.instance) {
      MyAgent.instance = new MyAgent();
    }
    return MyAgent.instance;
  }

  constructor() {
    // Subscribe to relevant events
    mcpEventBus.subscribe('context_created', this.handleContextUpdate.bind(this));
  }

  private async handleContextUpdate(event: any) {
    // Process context updates
  }

  async processRequest(sessionId: string, context: MCPContext) {
    try {
      // Agent logic here
      const result = await this.performTask(context);
      
      // Add context back to session
      mcpContextManager.addContext(sessionId, {
        intent: 'task_complete',
        entities: { result },
        source: 'my_agent'
      });

      // Emit response event
      await mcpEventBus.emit({
        type: 'agent_response',
        source: 'my_agent',
        payload: { result, sessionId }
      });

      return result;
    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  }

  private async performTask(context: MCPContext) {
    // Implement agent-specific logic
  }
}

export const myAgent = MyAgent.getInstance();
```

### Agent Communication Patterns

**Event-Driven Communication:**
```typescript
// Emitting events
await mcpEventBus.emit({
  type: 'agent_request',
  source: 'connector',
  payload: { action: 'find_matches', context }
});

// Subscribing to events
mcpEventBus.subscribe('agent_response', (event) => {
  if (event.source === 'analyst') {
    // Handle analyst response
  }
});
```

## Database Integration

### Supabase Client Usage
```typescript
import { supabase } from '@/integrations/supabase/client';

// Basic query
const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('verified', true)
  .order('created_at', { ascending: false });

// Complex query with joins
const { data, error } = await supabase
  .from('businesses')
  .select(`
    *,
    reviews (rating, comment),
    saved_businesses (user_id)
  `)
  .eq('category', 'Technology');

// Real-time subscriptions
const subscription = supabase
  .channel('business_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'businesses' },
    (payload) => {
      console.log('Business updated:', payload);
    }
  )
  .subscribe();
```

### RLS Policy Development
```sql
-- Example policy for businesses table
CREATE POLICY "Public businesses are viewable by everyone" 
ON public.businesses FOR SELECT 
USING (true);

CREATE POLICY "Users can update owned businesses" 
ON public.businesses FOR UPDATE 
USING (auth.uid() = owner_id);
```

## Testing

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './MyComponent';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Agent Testing
```typescript
import { mcpAgentConnector } from '@/services/mcp/MCPAgentConnector';

describe('Connector Agent', () => {
  it('finds business matches', async () => {
    const sessionId = 'test-session';
    const response = await mcpAgentConnector.findMatches(sessionId);
    
    expect(response.matches).toBeDefined();
    expect(response.totalMatches).toBeGreaterThan(0);
  });
});
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const BusinessDashboard = lazy(() => import('./pages/BusinessDashboard'));

// Route-based splitting
const App = () => (
  <Routes>
    <Route path="/dashboard" element={
      <Suspense fallback={<LoadingSpinner />}>
        <BusinessDashboard />
      </Suspense>
    } />
  </Routes>
);
```

### Memoization
```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

// Callback memoization
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Component memoization
const MemoizedComponent = memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

### Query Optimization
```typescript
// Pagination
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['businesses'],
  queryFn: ({ pageParam = 0 }) => fetchBusinesses(pageParam),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
});

// Prefetching
const queryClient = useQueryClient();
queryClient.prefetchQuery({
  queryKey: ['business', id],
  queryFn: () => fetchBusiness(id),
});
```

## Deployment

### Build Process
```bash
# Development
yarn dev

# Production build
yarn build

# Preview production build
yarn preview
```

### Environment Configuration
- No local .env files needed
- Configuration handled through Supabase
- Secrets managed in Supabase dashboard

### Deployment Checklist
1. ✅ All features tested locally
2. ✅ TypeScript compilation successful
3. ✅ No console errors
4. ✅ Performance metrics acceptable
5. ✅ Mobile responsiveness verified
6. ✅ SEO metadata configured
7. ✅ Analytics tracking implemented

## Best Practices

### Code Organization
1. Keep components small and focused
2. Use custom hooks for reusable logic
3. Separate business logic from UI components
4. Follow consistent naming conventions
5. Use TypeScript strictly

### Performance
1. Implement proper loading states
2. Use React.memo for expensive components
3. Optimize images and media
4. Implement virtual scrolling for large lists
5. Cache API responses appropriately

### Security
1. Validate all user inputs
2. Use RLS policies for data access
3. Sanitize dynamic content
4. Implement proper error boundaries
5. Follow OWASP guidelines

### Accessibility
1. Use semantic HTML elements
2. Provide proper ARIA labels
3. Ensure keyboard navigation
4. Maintain color contrast ratios
5. Test with screen readers

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript types
2. **Runtime Errors**: Check browser console
3. **API Errors**: Verify Supabase connection
4. **Styling Issues**: Check Tailwind classes
5. **Performance Issues**: Use React DevTools

### Debug Tools
1. React Developer Tools
2. Browser DevTools
3. Supabase Dashboard
4. React Query DevTools
5. Lighthouse for performance

This guide provides the foundation for developing and maintaining the BAMA AI Nexus platform. For specific implementation details, refer to the individual component and service documentation.
