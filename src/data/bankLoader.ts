import { getQuestionBank } from './questionBank';
import { firestoreDb } from '../lib/firebase/client';
import { collection, getDocs } from 'firebase/firestore';
import { Question } from '../types/questions';

export const loadBank = async (version?: string) => {
  const db = firestoreDb();
  if (!db) return getQuestionBank();

  try {
    const chunkRef = collection(db, 'banks', version ?? 'published', 'chunks');
    const snapshot = await getDocs(chunkRef);
    const questions = snapshot.docs.flatMap((docItem) => docItem.data().questions as Question[]);
    return questions.length ? questions : getQuestionBank();
  } catch (error) {
    console.warn('Remote bank load failed, using local bank', error);
    return getQuestionBank();
  }
};
