import admin from "@/utils/firebaseAdmin";
import type {
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import type { VaultDocument } from "@/utils/types/vault_document";

const vaultConverter: FirestoreDataConverter<VaultDocument> = {
  toFirestore(model: VaultDocument) {
    return { ...model } as FirebaseFirestore.DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data() as VaultDocument;
    return data;
  },
};

export function vaultsCollection(
  factoryId: string
): CollectionReference<VaultDocument> {
  const db = admin.firestore();
  return db.collection(factoryId).withConverter(vaultConverter);
}

export function vaultDoc(
  factoryId: string,
  vaultId: string
): DocumentReference<VaultDocument> {
  return vaultsCollection(factoryId).doc(vaultId);
}
