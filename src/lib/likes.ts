import { auth, db } from "@/lib/firebase.client";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";

export async function toggleLike(productId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("login-required");
  const ref = doc(db, `products/${productId}/likes/${uid}`);
  const snap = await getDoc(ref);
  if (snap.exists()) await deleteDoc(ref);
  else await setDoc(ref, { createdAt: serverTimestamp() });
}

export async function getLikeCount(productId: string) {
  const coll = collection(db, `products/${productId}/likes`);
  const agg = await getCountFromServer(coll);
  return agg.data().count as number;
}

export async function getMyLike(productId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  const ref = doc(db, `products/${productId}/likes/${uid}`);
  return (await getDoc(ref)).exists();
}
