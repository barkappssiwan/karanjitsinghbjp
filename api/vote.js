// api/vote.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Add MONGODB_URI in Vercel Settings!');
}

let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await clientPromise;
    const collection = client.db('votesdb').collection('votes');

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
    console.error('Vote error:', err.message);
    return res.status(500).json({ error: 'DB error', details: err.message });
  }
}
