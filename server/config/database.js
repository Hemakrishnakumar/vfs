import {MongoClient} from 'mongodb';
import { configDotenv } from 'dotenv';
configDotenv()

const client = await MongoClient.connect(process.env.CONNECTION_STRING);
const db = client.db('vfs');

process.on('SIGINT', async () => {
    client.close();
    console.log('Database disconnected');
    process.exit(0);
})

export const users = db.collection('users');
export const directories = db.collection('directories');
export const files = db.collection('files');