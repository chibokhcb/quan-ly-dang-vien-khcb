import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
    writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const isMockMode = (): boolean => {
    return import.meta.env.VITE_USE_MOCK_DATA === 'true';
};

export const isFirestoreEnabled = (): boolean => !isMockMode();

export async function fetchCollection(collectionName){
    if (isMockMode()) return [];
    try {
          const snap = await getDocs(collection(db, collectionName));
          return snap.docs.map((d) => d.data());
    } catch (err) {
          console.warn('[firestoreSync] fetchCollection failed: ' + collectionName, err);
          return [];
    }
}

export async function fetchDoc(collectionName, docId){
    if (isMockMode()) return null;
    try {
          const snap = await getDoc(doc(db, collectionName, docId));
          return snap.exists() ? snap.data() : null;
    } catch (err) {
          console.warn('[firestoreSync] fetchDoc failed: ' + collectionName + '/' + docId, err);
          return null;
    }
}

export function setItem(collectionName, id, data){
    if (isMockMode() || !id) return;
    setDoc(doc(db, collectionName, String(id)), JSON.parse(JSON.stringify(data)), { merge: true }).catch((err) => {
          console.warn('[firestoreSync] setItem failed: ' + collectionName + '/' + id, err);
    });
}

export function setDocData(collectionName, docId, data){
    if (isMockMode()) return;
    setDoc(doc(db, collectionName, docId), JSON.parse(JSON.stringify(data)), { merge: true }).catch((err) => {
          console.warn('[firestoreSync] setDocData failed: ' + collectionName + '/' + docId, err);
    });
}

export function removeItem(collectionName, id){
    if (isMockMode() || !id) return;
    deleteDoc(doc(db, collectionName, String(id))).catch((err) => {
          console.warn('[firestoreSync] removeItem failed: ' + collectionName + '/' + id, err);
    });
}

export async function setCollectionBulk(collectionName, items, idField){
    if (isMockMode() || !items || items.length === 0) return;
    const fieldName = idField || 'id';
    try {
          const batchSize = 400;
          for (let i = 0; i < items.length; i += batchSize) {
                  const batch = writeBatch(db);
                  const chunk = items.slice(i, i + batchSize);
                  chunk.forEach((item) => {
                            const id = String(item[fieldName]);
                            if (!id) return;
                            batch.set(doc(db, collectionName, id), JSON.parse(JSON.stringify(item)), { merge: true });
                  });
                  await batch.commit();
          }
    } catch (err) {
          console.warn('[firestoreSync] setCollectionBulk failed: ' + collectionName, err);
    }
}
