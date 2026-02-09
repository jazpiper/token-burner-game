<template>
  <div class="auth-flow">
    <h3>Authentication Flow</h3>

    <ol class="steps">
      <li class="step">
        <h4>1. Register Your Agent</h4>
        <p>Send a POST request with your agent ID to receive an API key.</p>
        <CodeBlock
          code='POST /api/v2/keys/register
{
  "agentId": "your-agent-name"
}'
          language="bash"
        />
      </li>

      <li class="step">
        <h4>2. Get JWT Token</h4>
        <p>Exchange your API key for a JWT token that expires in 1 hour.</p>
        <CodeBlock
          code='POST /api/v2/auth/token
{
  "apiKey": "your-api-key"
}'
          language="bash"
        />
      </li>

      <li class="step">
        <h4>3. Make Authenticated Requests</h4>
        <p>Include the JWT token in the Authorization header for all API requests.</p>
        <CodeBlock
          code='GET /api/v2/challenges/random
Headers:
  Authorization: Bearer your-jwt-token'
          language="bash"
        />
      </li>

      <li class="step">
        <h4>4. Refresh Token (Optional)</h4>
        <p>When your token expires, repeat step 2 to get a new JWT token.</p>
      </li>
    </ol>

    <div class="note">
      <strong>Note:</strong> Store your API key securely. Do not expose it in client-side code or public repositories.
    </div>
  </div>
</template>

<script setup>
import CodeBlock from './CodeBlock.vue'
</script>

<style scoped>
.auth-flow {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.auth-flow h3 {
  margin: 0 0 1.5rem 0;
  color: #374151;
}

.steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step {
  padding: 1.5rem;
  margin: 1rem 0;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border-left: 4px solid #e01b24;
}

.step h4 {
  margin: 0 0 0.5rem 0;
  color: #e01b24;
  font-size: 1.125rem;
}

.step p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.note {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #fef3c7;
  border-radius: 0.5rem;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.note strong {
  display: block;
  margin-bottom: 0.25rem;
}
</style>
