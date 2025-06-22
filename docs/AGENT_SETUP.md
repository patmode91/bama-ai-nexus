
# AI Agent Setup and Configuration Guide

## Overview

This guide explains how to set up and configure the AI agent system in BAMA AI Nexus for local development and testing.

## Agent Architecture

The BAMA AI Nexus uses a Multi-Agent Collaborative Protocol (MCP) system with three specialized agents:

1. **The Connector**: Business discovery and matching
2. **The Analyst**: Market intelligence and insights  
3. **The Curator**: Data enrichment and quality analysis

## Prerequisites

Before setting up the agents, ensure you have:

- Node.js 18+ installed
- The project running locally (`yarn dev`)
- Supabase project configured
- Google AI API key configured

## Required API Keys and Secrets

### 1. Google AI API Key (Required)
The agents use Google's Gemini AI for natural language processing.

**Setup Steps:**
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. In your local Supabase project, add the secret:
   - Navigate to Project Settings > Edge Functions
   - Add secret: `GOOGLE_AI_API_KEY` = your_api_key

**Note**: This key should already be configured in your Supabase project secrets.

## Agent Configuration

### 1. MCP Context Manager
The Context Manager coordinates communication between agents.

**Key Features:**
- Session management
- Context sharing
- Event coordination
- State persistence

**Configuration:**
- No additional setup required
- Uses in-memory storage for development
- Automatic session creation

### 2. The Connector Agent

**Purpose**: Finds and matches businesses based on user requirements

**Setup Process:**
1. The agent automatically initializes when the app starts
2. Connects to the Supabase database
3. Subscribes to context updates
4. Ready to process search requests

**Testing The Connector:**
```typescript
// Example usage in the browser console or test environment
import { mcpAgentConnector } from '@/services/mcp/MCPAgentConnector';

// Create a test session
const sessionId = 'test-session-123';

// Test finding matches
const response = await mcpAgentConnector.findMatches(sessionId);
console.log('Connector Response:', response);
```

### 3. The Analyst Agent

**Purpose**: Provides market intelligence and business insights

**Setup Process:**
1. Initializes with market analysis capabilities
2. Connects to business data sources
3. Subscribes to context updates for automatic analysis

**Testing The Analyst:**
```typescript
import { mcpAgentAnalyst } from '@/services/mcp/MCPAgentAnalyst';

// Test market analysis
const context = {
  industry: 'Technology',
  location: 'Birmingham',
  intent: 'find_market_insights'
};

const insights = await mcpAgentAnalyst.generateMarketInsights(sessionId, context);
console.log('Market Insights:', insights);
```

### 4. The Curator Agent

**Purpose**: Enriches business data and analyzes quality

**Setup Process:**
1. Initializes data enrichment services
2. Connects to data quality analyzers
3. Ready to process enrichment requests

**Testing The Curator:**
```typescript
import { mcpAgentCurator } from '@/services/mcp/MCPAgentCurator';

// Test data enrichment
const businesses = [/* business objects */];
const context = { intent: 'enrich_data' };

const enriched = await mcpAgentCurator.enrichBusinessData(sessionId, businesses, context);
console.log('Enriched Data:', enriched);
```

## Setting Up Agent Communication

### 1. Event Bus Configuration
The agents communicate through an event bus system.

**No additional setup required** - the event bus initializes automatically.

### 2. Real-time Communication Hub
Monitor agent communications in real-time.

**To enable:**
1. Navigate to `/realtime` in your local app
2. You'll see the Agent Communication Hub
3. Monitor live agent interactions

## Testing the Complete Agent System

### Using the MCP Hook
The `useMCP` hook provides a complete interface for testing all agents.

**Example Test Scenario:**
```typescript
// In a React component or test environment
import { useMCP } from '@/hooks/useMCP';

function TestAgents() {
  const {
    initializeSession,
    processMessage,
    runFullAnalysis,
    agentResponses
  } = useMCP('test-user-id');

  const testFullSystem = async () => {
    // Initialize session
    const sessionId = initializeSession();
    
    // Process a user message
    await processMessage("Find AI companies in Birmingham that do machine learning");
    
    // Run complete analysis with all agents
    const results = await runFullAnalysis(
      "find_business_solution",
      {
        services: ["Machine Learning", "AI Solutions"],
        location: "Birmingham",
        industry: "Technology"
      }
    );
    
    console.log('Full Analysis Results:', results);
    console.log('Agent Responses:', agentResponses);
  };

  return (
    <button onClick={testFullSystem}>
      Test Complete Agent System
    </button>
  );
}
```

### Using BamaBot for Testing
The enhanced BamaBot integrates with all agents.

**Test Commands:**
1. Open BamaBot on your local site
2. Try these test queries:
   - "Find tech companies in Birmingham"
   - "What's the AI market like in Alabama?"
   - "Show me machine learning startups"
   - "Analyze the healthcare AI sector"

## Monitoring and Debugging

### 1. Console Logging
All agents log their activities to the browser console.

**Enable detailed logging:**
```javascript
// Set localStorage flag for debug mode
localStorage.setItem('mcp_debug', 'true');
```

### 2. Agent Communication Hub
Real-time monitoring of agent activities:

1. Visit `/realtime` in your app
2. View live agent communications
3. Filter by agent type
4. Monitor performance metrics

### 3. Network Requests
Monitor agent API calls in browser DevTools:
- Check Network tab for Supabase requests
- Look for Edge Function calls
- Monitor response times

## Troubleshooting

### Common Issues

**1. Agent Not Responding**
- Check Google AI API key is set
- Verify Supabase connection
- Check browser console for errors

**2. No Business Matches Found**
- Ensure sample data exists in database
- Check search criteria
- Verify database permissions

**3. Context Not Persisting**
- Check session initialization
- Verify context manager is working
- Look for JavaScript errors

### Debug Commands

**Check Agent Status:**
```javascript
// In browser console
console.log('MCP Status:', window.mcpDebugInfo);
```

**Reset Agent Sessions:**
```javascript
// Clear all sessions
localStorage.removeItem('mcp_sessions');
location.reload();
```

## Development Workflow

### 1. Local Testing Flow
1. Start development server: `yarn dev`
2. Open browser to `http://localhost:8080`
3. Open browser DevTools
4. Test agents through UI or console
5. Monitor responses and logs

### 2. Agent Development
When modifying agent code:
1. Save changes to agent files
2. Refresh browser (hot reload enabled)
3. Test updated functionality
4. Check console for errors

### 3. Adding New Agent Features
1. Modify agent service files in `/src/services/mcp/`
2. Update type definitions if needed
3. Test through hooks or direct calls
4. Update documentation

## Production Considerations

### 1. Environment Variables
Ensure all required secrets are set in production Supabase project.

### 2. Rate Limiting
The Google AI API has rate limits - monitor usage in production.

### 3. Database Performance
Optimize queries as business data grows.

### 4. Monitoring
Set up proper logging and monitoring for production agent performance.

## Next Steps

Once agents are working locally:
1. Test all agent interactions
2. Verify real-time communication
3. Test with sample data
4. Monitor performance
5. Deploy to production environment

For additional support, check the main documentation or contact the development team.
