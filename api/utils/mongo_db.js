import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

class Mongo_DB {
    constructor () {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'HomeBuddy';

        const uri = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Connect to the database
        this.client.connect().then(() => {
            console.log('MongoDB connected...');
            this.users = this.client.db(database).collection("Users");
        }).catch((err) => {
            console.error('Database connection failed:', err.message);
            process.exit(1);
        });
    }
}

const dbClient = new Mongo_DB()
export default dbClient