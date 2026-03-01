import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * クリップボード履歴をFirestoreに保存
 */
export const saveClipboardEntry = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        '認証が必要です'
      );
    }

    const { content, type, aiSummary, tags } = data;
    const userId = context.auth.uid;

    const entry = {
      content,
      type: type || 'text',
      aiSummary: aiSummary || null,
      tags: tags || [],
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      pinned: false,
    };

    const docRef = await db
      .collection('users')
      .doc(userId)
      .collection('clipboard_history')
      .add(entry);

    return { id: docRef.id, ...entry };
  }
);

/**
 * クリップボード履歴を取得
 */
export const getClipboardHistory = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        '認証が必要です'
      );
    }

    const userId = context.auth.uid;
    const limit = data?.limit || 50;

    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('clipboard_history')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
);

/**
 * 古い履歴を定期的にクリーンアップ（30日以上前のピン留めされていないエントリ）
 */
export const cleanupOldEntries = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usersSnapshot = await db.collection('users').get();

    const batch = db.batch();
    let deleteCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const oldEntries = await db
        .collection('users')
        .doc(userDoc.id)
        .collection('clipboard_history')
        .where('pinned', '==', false)
        .where('timestamp', '<', thirtyDaysAgo)
        .get();

      for (const entry of oldEntries.docs) {
        batch.delete(entry.ref);
        deleteCount++;
      }
    }

    if (deleteCount > 0) {
      await batch.commit();
    }

    console.log(`Cleaned up ${deleteCount} old clipboard entries`);
  });
