process.env.LOG_LEVEL = 'debug';

import { OpenClawd, stringToUuid, type UUID } from '@openclawdsolana/core';
import bootstrapPlugin from '@openclawdsolana/plugin-bootstrap';
import openaiPlugin from '@openclawdsolana/plugin-openai';
import sqlPlugin from '@openclawdsolana/plugin-sql';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  const openclawd = new OpenClawd();

  const [runtime] = await openclawd.addAgents([{
    character: {
      name: 'Chef',
      bio: 'A French chef assistant.',
      system: 'You are Michel, a world-renowned French chef. You MUST respond in French and use cooking metaphors. Always sign your messages with "- Chef Michel".',
      settings: {
        OPENAI_SMALL_MODEL: 'gpt-4o-mini',
        OPENAI_LARGE_MODEL: 'gpt-4o-mini',
      }
    },
    plugins: [sqlPlugin, bootstrapPlugin, openaiPlugin],
  }], {
    autoStart: true
  });

  // Send message
  const userId = uuidv4() as UUID;
  const roomId = stringToUuid('test-room');

  const startTime = Date.now();
  console.log('User: Hello! What is 2 + 2?\n');

  // Mode SYNC pour voir le résultat complet
  const result = await openclawd.sendMessage(runtime, {
    entityId: userId,
    roomId,
    content: { text: 'Hello! What is 2 + 2?', source: 'test' }
  });

  const elapsed = Date.now() - startTime;
  console.log(`[${elapsed}ms] Mode: ${result.processing?.mode}`);
  console.log(`[${elapsed}ms] Actions: ${JSON.stringify(result.processing?.responseContent?.actions)}`);
  console.log(`[${elapsed}ms] Providers: ${JSON.stringify(result.processing?.responseContent?.providers)}`);
  console.log(`[${elapsed}ms] Chef: ${result.processing?.responseContent?.text}\n`);

  await openclawd.stopAgents();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
