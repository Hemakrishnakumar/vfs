import {MongoClient} from 'mongodb';
import { config } from 'dotenv';
config();

export const client = new MongoClient(process.env.CONNECTION_STRING);

async function connectToDB() {
    try {
        await client.connect();
        const db = client.db('vfs');
        console.log("CONNECTED TO DB SUCCUESSFULLY.");
        //applyDBSchema(db);
        return db;
    } catch(err){
        console.log('Failed to connect to db.',err.message);
    }
}

export const db = await connectToDB();

process.on('SIGINT', async () => {
    client.close();
    console.log('Database disconnected');
    process.exit(0);
})

export const users = db.collection('users');
export const directories = db.collection('directories');
export const files = db.collection('files');



async function applyDBSchema(db){
    await db.command({
    create: "users",
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                '_id',
                'name',
                'email',
                'password',
                'rootDirId'
            ],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string',
                    minLength: 3
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
                },
                password: {
                    bsonType: 'string'
                },
                rootDirId: {
                    bsonType: 'objectId'
                }
            },
            additionalProperties: false
        }
    },
    validationAction: 'error',
    validationLevel: 'strict'
})

await db.command({
    create: "files",
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                '_id',
                'name',
                'extension',
                'parentDirId',
                'userId'
            ],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string'
                },
                extension: {
                    bsonType: 'string'
                },
                parentDirId: {
                    bsonType: 'objectId'
                },
                userId: {
                    bsonType: 'objectId'
                }
            }
        }
    },
    validationAction: 'error',
    validationLevel: 'strict'
})

await db.command({
    create: "directories",
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: [
                '_id',
                'name',
                'userId',
                'parentDirId'
            ],
            properties: {
                _id: {
                    bsonType: 'objectId'
                },
                name: {
                    bsonType: 'string'
                },
                parentDirId: {
                    bsonType: [
                        'objectId',
                        'null'
                    ]
                },
                userId: {
                    bsonType: 'objectId'
                }
            },
            additionalProperties: false
        }
    },
    validationAction: 'error',
    validationLevel: 'strict'
})
} 