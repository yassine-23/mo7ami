require('dotenv').config();
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set ✅' : 'Missing ❌');
