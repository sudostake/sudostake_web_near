import admin from "@/utils/firebaseAdmin";
import type {
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

export type IndexingJobStatus = "pending" | "processing" | "succeeded" | "failed";

export type IndexingJob = {
  id: string; // `${factory_id}:${vault}` convenience
  factory_id: string;
  vault: string;
  tx_hash?: string;
  status: IndexingJobStatus;
  attempts: number;
  next_run_at?: FirebaseFirestore.Timestamp;
  lease_until?: FirebaseFirestore.Timestamp;
  last_error?: string;
  created_at: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
};

const jobConverter: FirestoreDataConverter<IndexingJob> = {
  toFirestore(model: IndexingJob) {
    return { ...model } as FirebaseFirestore.DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot) {
    const data = snapshot.data() as IndexingJob;
    return data;
  },
};

export function jobsCollection(): CollectionReference<IndexingJob> {
  const db = admin.firestore();
  return db.collection("indexing_jobs").withConverter(jobConverter);
}

export function jobId(factoryId: string, vault: string) {
  return `${factoryId}:${vault}`;
}

export function jobDoc(factoryId: string, vault: string): DocumentReference<IndexingJob> {
  return jobsCollection().doc(jobId(factoryId, vault));
}

export function nowTs(): FirebaseFirestore.Timestamp {
  return admin.firestore.Timestamp.now();
}

export function serverNow(): FirebaseFirestore.FieldValue {
  return admin.firestore.FieldValue.serverTimestamp();
}

/** A small helper to create a Firestore Timestamp for a date in the future. */
export function timestampFromDate(date: Date): FirebaseFirestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(date);
}

/**
 * Attempt to claim a job for processing by setting its status to "processing",
 * incrementing attempts and setting a lease_until in the near future. Returns
 * the claimed job document snapshot if successful, otherwise null.
 */
export async function claimNextJob(options?: {
  maxAttempts?: number;
  leaseSeconds?: number;
}): Promise<FirebaseFirestore.QueryDocumentSnapshot<IndexingJob> | null> {
  const db = admin.firestore();
  const col = jobsCollection();
  const now = admin.firestore.Timestamp.now();
  const maxAttempts = options?.maxAttempts ?? 6;
  const leaseSeconds = options?.leaseSeconds ?? 60;

  // Helper to try claim one of the provided candidates
  const tryClaim = async (
    candidates: FirebaseFirestore.QueryDocumentSnapshot<IndexingJob>[]
  ): Promise<FirebaseFirestore.QueryDocumentSnapshot<IndexingJob> | null> => {
    for (const snap of candidates) {
      try {
        const result = await db.runTransaction(async (tx) => {
          const fresh = await tx.get(snap.ref);
          if (!fresh.exists) return null;
          const job = fresh.data() as IndexingJob;
          const leaseExpired = !job.lease_until || job.lease_until.toMillis() <= now.toMillis();
          const isPending = job.status === "pending";
          const isRetryableFailed =
            job.status === "failed" && job.next_run_at && job.next_run_at.toMillis() <= now.toMillis();
          const isStaleProcessing = job.status === "processing" && leaseExpired;
          const attemptsOk = (job.attempts ?? 0) < maxAttempts;
          if (!attemptsOk) return null;
          if (!(leaseExpired && (isPending || isRetryableFailed || isStaleProcessing))) return null;

          const leaseUntil = admin.firestore.Timestamp.fromMillis(now.toMillis() + leaseSeconds * 1000);
          tx.update(snap.ref, {
            status: "processing",
            attempts: (job.attempts ?? 0) + 1,
            lease_until: leaseUntil,
            updated_at: serverNow(),
          });
          return fresh as FirebaseFirestore.QueryDocumentSnapshot<IndexingJob>;
        });
        if (result) return result;
      } catch (e) {
        // Ignore and try next candidate in case of contention
      }
    }
    return null;
  };

  // Prefer fresh pending jobs first
  const pendingSnap = await col
    .where("status", "==", "pending")
    .orderBy("updated_at", "asc")
    .limit(10)
    .get();
  const claimedPending = await tryClaim(pendingSnap.docs);
  if (claimedPending) return claimedPending;

  // Then failed jobs that are due to retry
  const failedDueSnap = await col
    .where("status", "==", "failed")
    .where("next_run_at", "<=", now)
    .orderBy("next_run_at", "asc")
    .limit(10)
    .get();
  const claimedFailed = await tryClaim(failedDueSnap.docs);
  if (claimedFailed) return claimedFailed;

  // Next, reclaim abandoned "processing" jobs with an expired lease (fast path)
  const processingExpiredSnap = await col
    .where("status", "==", "processing")
    .where("lease_until", "<=", now)
    .orderBy("lease_until", "asc")
    .limit(10)
    .get();
  const claimedExpired = await tryClaim(processingExpiredSnap.docs);
  if (claimedExpired) return claimedExpired;

  // All processing jobs should have a lease_until; legacy docs can be fixed by
  // running the backfill script (npm run repair:processing-leases). We rely on
  // the fast-path query above for reclaiming.

  return null;
}

export async function markJobSucceeded(ref: DocumentReference<IndexingJob>) {
  await ref.update({
    status: "succeeded",
    lease_until: admin.firestore.FieldValue.delete(),
    next_run_at: admin.firestore.FieldValue.delete(),
    last_error: admin.firestore.FieldValue.delete(),
    updated_at: serverNow(),
  });
}

export async function markJobFailed(
  ref: DocumentReference<IndexingJob>,
  errorMessage: string,
  nextRunAt: FirebaseFirestore.Timestamp
) {
  await ref.update({
    status: "failed",
    lease_until: admin.firestore.FieldValue.delete(),
    next_run_at: nextRunAt,
    last_error: errorMessage.substring(0, 5000),
    updated_at: serverNow(),
  });
}
