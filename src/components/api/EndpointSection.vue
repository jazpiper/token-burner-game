<template>
  <article class="endpoint" :id="slug">
    <h3>
      <span class="method" :class="endpoint.method.toLowerCase()">{{ endpoint.method }}</span>
      <code>{{ endpoint.path }}</code>
    </h3>

    <p class="description">{{ endpoint.description }}</p>

    <div v-if="endpoint.requestBody" class="section">
      <h4>Request Body</h4>
      <CodeBlock :code="formatObject(endpoint.requestBody)" language="json" />
    </div>

    <div v-if="endpoint.params" class="section">
      <h4>Query Parameters</h4>
      <CodeBlock :code="formatObject(endpoint.params)" language="json" />
    </div>

    <div v-if="endpoint.headers" class="section">
      <h4>Headers</h4>
      <CodeBlock :code="formatObject(endpoint.headers)" language="json" />
    </div>

    <div class="section">
      <h4>Response Format</h4>
      <CodeBlock :code="formatObject(endpoint.response)" language="json" />
    </div>

    <div v-if="endpoint.example" class="section example">
      <h4>Example</h4>
      <div v-if="endpoint.example.request" class="example-request">
        <strong>Request:</strong>
        <CodeBlock
          :code="typeof endpoint.example.request === 'string' ? endpoint.example.request : JSON.stringify(endpoint.example.request, null, 2)"
          language="bash"
        />
      </div>
      <div v-if="endpoint.example.response" class="example-response">
        <strong>Response:</strong>
        <CodeBlock
          :code="JSON.stringify(endpoint.example.response, null, 2)"
          language="json"
        />
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import CodeBlock from './CodeBlock.vue'

const props = defineProps({
  endpoint: {
    type: Object,
    required: true
  }
})

const slug = computed(() => {
  return props.endpoint.path.replace(/[^a-z0-9]/gi, '-').toLowerCase()
})

function formatObject(obj) {
  return JSON.stringify(obj, null, 2)
}
</script>

<style scoped>
.endpoint {
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.endpoint h3 {
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.method {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  min-width: 4rem;
  text-align: center;
}

.method.get {
  background-color: #dbeafe;
  color: #1e40af;
}

.method.post {
  background-color: #dcfce7;
  color: #166534;
}

.method.put {
  background-color: #fef9c3;
  color: #854d0e;
}

.method.delete {
  background-color: #fee2e2;
  color: #991b1b;
}

.endpoint h3 code {
  background: transparent;
  color: #374151;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
}

.description {
  margin: 1rem 0;
  line-height: 1.6;
}

.section {
  margin-top: 1.5rem;
}

.section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #374151;
}

.example {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}

.example-request,
.example-response {
  margin-bottom: 1.5rem;
}

.example-response {
  margin-bottom: 0;
}

.example strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
