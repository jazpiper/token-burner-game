import { getAllApiKeys, getApiKeyInfo } from './api/shared/apiKeyStore.js';

console.log('=== All API Keys ===');
const keys = getAllApiKeys();
console.log(JSON.stringify(keys, null, 2));

console.log('\n=== Get API Key Info ===');
const info = getApiKeyInfo('jzp-xxwv4gqw-ml7zdruk');
console.log(JSON.stringify(info, null, 2));
