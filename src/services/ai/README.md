# AI Agents Implementation

This directory contains the implementation of the AI Agents for the BAMA AI Nexus platform. The agents are built using a Multi-Agent Collaborative Protocol (MCP) and leverage Google's Gemini AI for natural language processing.

## Agents Overview

### 1. The Connector Agent
Responsible for business discovery and matching. It helps users find relevant businesses based on their queries.

**Key Features:**
- Semantic search across business listings
- Intelligent business matching
- Real-time data integration
- Caching for performance

### 2. The Analyst Agent
Provides market intelligence and insights. It analyzes market trends and provides data-driven recommendations.

**Key Features:**
- Market trend analysis
- Competitive intelligence
- Industry insights
- Data visualization

### 3. The Curator Agent
Handles data enrichment and quality. It ensures business data is accurate, complete, and up-to-date.

**Key Features:**
- Business data enrichment
- Data validation
- Automated updates
- Quality scoring

## Implementation Details

### Core Components

1. **Semantic Search Engine**
   - Vector embeddings for business listings
   - Similarity search using PostgreSQL's vector extension
   - Caching layer for improved performance

2. **Market Data API**
   - Integration with external data sources (BLS, Census)
   - Caching mechanism for rate limiting
   - Data normalization and transformation

3. **Business Data API**
   - Integration with business data providers (Clearbit, ZoomInfo)
   - Data enrichment services
   - Social media and news integration

4. **Prediction Engine**
   - Machine learning model for predictions
   - Training pipeline
   - Model evaluation and monitoring

### Database Schema

The following tables are used by the AI agents:

- `agent_requests`: Tracks all agent requests and their status
- `search_cache`: Caches search results for performance
- `business_embeddings`: Stores vector embeddings for semantic search

## Setup Instructions

### Prerequisites

1. Node.js 18+
2. Supabase project with PostgreSQL 14+
3. Google AI API key
4. Required environment variables (see `.env.example`)

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI/ML
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# External APIs
VITE_BLS_API_KEY=your_bls_api_key
VITE_CENSUS_API_KEY=your_census_api_key
VITE_CLEARBIT_API_KEY=your_clearbit_api_key
VITE_ZOOMINFO_API_KEY=your_zoominfo_api_key
VITE_NEWS_API_KEY=your_news_api_key
```

### Database Setup

Run the following SQL migration to set up the required database schema:

```sql
-- Run this in your Supabase SQL editor
\i supabase/migrations/20240101000000_ai_agents_schema.sql
```

### Development

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start the development server:
   ```bash
   yarn dev
   ```

3. The AI agents will be available at the following endpoints:
   - `http://localhost:3000/api/ai/connector`
   - `http://localhost:3000/api/ai/analyst`
   - `http://localhost:3000/api/ai/curator`

## Usage

### Making Requests to AI Agents

```typescript
import { mcpAgentConnector } from '@/services/ai/connector';

// Example: Search for businesses
const results = await mcpAgentConnector.findBusinesses({
  query: 'AI companies in Birmingham',
  filters: {
    industry: 'Technology',
    location: 'Birmingham, AL',
  },
  limit: 10,
});
```

### Using the Semantic Search

```typescript
import { semanticSearchEngine } from '@/services/ai/semanticSearchEngine';

// Generate embeddings for a query
const query = 'Find machine learning companies';
const results = await semanticSearchEngine.semanticSearch(query);
```

### Enriching Business Data

```typescript
import { businessDataAPI } from '@/services/external/businessDataAPI';

// Enrich a business profile
const enrichedData = await businessDataAPI.enrichBusinessProfile('business-id-123');
```

## Testing

Run the test suite:

```bash
yarn test
```

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)

3. Set up the Supabase Edge Function for the AI Agent Orchestrator:
   ```bash
   supabase functions deploy ai-agent-orchestrator
   ```

## Monitoring and Logging

- All agent requests are logged to the `agent_requests` table
- Errors are logged to the console and can be monitored in your logging service
- Performance metrics are available in the application's monitoring dashboard

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
