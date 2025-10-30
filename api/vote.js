// api/vote.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'votesdb';
const collectionName = 'votes';

export default async function handler(req, res) {
    if (!uri) {
        return res.status(500).json({ error: 'No database URI configured' });
    }

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        if (req.method === 'GET') {
            // Fetch current count (default to 0 if none)
            const result = await collection.findOne({ _id: 'totalVotes' }) || { count: 0 };
            res.status(200).json({ votes: result.count });
        } else if (req.method === 'POST') {
            // Increment count
            await collection.updateOne(
                { _id: 'totalVotes' },
                { $inc: { count: 1 } },
                { upsert: true }
            );
            res.status(200).json({ success: true });
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to process vote' });
    } finally {
        await client.close();
    }
}
