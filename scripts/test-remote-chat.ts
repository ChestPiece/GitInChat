
import * as readline from 'readline';

const API_URL = 'http://localhost:3000/api/chat';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat() {
  console.log('GitHub Chat Remote Verification Script');
  console.log(`Connecting to ${API_URL}`);
  console.log('Type "exit" to quit.');
  console.log('-------------------------------');

  const messages: { role: string; content: string }[] = [];

  const askQuestion = () => {
    rl.question('User: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      messages.push({ role: 'user', content: input });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error: ${response.status} ${response.statusText}`, text);
            return askQuestion();
        }

        if (!response.body) {
            console.error('No response body');
            return askQuestion();
        }

        console.log('Assistant: ');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          process.stdout.write(chunk);
        }
        console.log('\n');
        
        // Note: In a real app we'd parse the full response to update 'messages' history correctly
        // content += chunk;
        // messages.push({ role: 'assistant', content: ... }) 
        // For verification, we just print the stream.

      } catch (error) {
        console.error('Error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

chat();
