import { createClient } from "redis";

const client = createClient();

client.on('connect', ()=>{
    console.log('Redis is connected');
})
client.on('error', (err)=>{
    console.error('Error connecting redis', err);
})

client.connect();


// client.quit();
export default client;


