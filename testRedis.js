import { createClient } from 'redis';

const client = createClient({
    url: 'redis://127.0.0.1:6379',
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});

client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

client.on('ready', () => {
    console.log('Redis Client is ready!');
});

client.connect() // We need to explicitly connect to Redis in v4.x+
    .then(() => {
        // Set key with expiration (set the option `EX` to specify expiration in seconds)
        return client.set('testKey', 'testValue', { EX: 5 });
    })
    .then(() => {
        // Get the key after setting it
        return client.get('testKey');
    })
    .then((value) => {
        console.log('Get key:', value);  // Should output 'testValue'
        client.quit();  // Close the Redis connection after the test
    })
    .catch((err) => {
        console.error('Error in Redis operations:', err);
        client.quit();
    });

