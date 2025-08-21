/* eslint-disable */
// @ts-nocheck
import * as admin from 'firebase-admin';

async function migrate() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  console.log(`Found ${snapshot.size} products`);
  let migrated = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const seller = data.seller;
    const operatorIds = data.operatorIds;
    if (seller && (!operatorIds || operatorIds.length === 0)) {
      await doc.ref.update({
        operatorIds: [seller],
        seller: admin.firestore.FieldValue.delete(),
      });
      migrated++;
      console.log(`Migrated ${doc.id}`);
    }
  }
  console.log(`Migration complete. Updated ${migrated} documents.`);
}

migrate().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
