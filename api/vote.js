// api/vote.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'votesdb';
const COLL_NAME = 'votes';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is missing – add it in Vercel → Settings → Environment Variables');
}

/* ---- Re-use connection (safe for Vercel) ---- */
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // local dev – keep one connection alive
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Vercel – fresh connection per invocation
  const client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

/* ---- Handler ---- */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection(COLL_NAME);

    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: 'totalVotes' });
      return res.status(200).json({ votes: doc?.count || 0 });
    }

    if (req.method === 'POST') {
      await collection.updateOne(
        { _id: 'totalVotes' },
        { $inc: { count: 1 } },
        { upsert: true }
      );
      const doc = await collection.findOne({ _id: 'totalVotes' });
      return res.status(200).json({ success: true, votes: doc?.count || 1 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Vote API error:', err);
    return res.status(500).json({ error: 'DB error', details: err.message });
  }
}
