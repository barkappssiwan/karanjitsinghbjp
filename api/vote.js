// api/vote.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = 'votesdb';
const collectionName = 'votes';

// Reuse client across invocations (Vercel serverless best practice)
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    return { db: cachedDb, client: cachedClient };
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Keep connections alive
  });

  await client.connect();
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { db, client };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let client;
  try {
    const { db } = await connectToDatabase();
    client = cachedClient;
    const collection = db.collection(collectionName);

    if (req.method === 'GET') {
      const result = await collection.findOne({ _id: 'totalVotes' });
      const votes = result?.count || 0;
      return res.status(200).json({ votes });
    }

    if (req.method === 'POST') {
      await collection.updateOne(
        { _id: 'totalVotes' },
        { $inc: { count: 1 } },
        { upsert: true }
      );

      // Get updated count
      const result = await collection.findOne({ _id: 'totalVotes' });
      const votes = result?.count || 1;

      return res.status(200).json({ success: true, votes });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'Failed to process vote', details: error.message });
  }
  // DO NOT CLOSE CLIENT HERE
}
