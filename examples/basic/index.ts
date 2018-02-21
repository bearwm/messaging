import { sender } from './setup';
import { HelloMessage } from './HelloMessage';

console.log('Running basic example...');

async function run() {
  const msg = new HelloMessage('World');
  const result = await sender.submit(msg);

  console.log(result);
}

run().then(() => { console.log('Completed.'); });
