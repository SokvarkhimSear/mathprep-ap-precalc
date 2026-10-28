# Security Specification for MathPrep Firestore Database

## 1. Data Invariants
1. A user document `/users/{userId}` can only be read and written by the authenticated owner where `request.auth.uid == userId`.
2. All writes to student progress and exam attempts require `request.auth.token.email_verified == true`.
3. Subcollection documents (`/users/{userId}/progress/{progressId}` and `/users/{userId}/attempts/{attemptId}`) inherit the owner identity from the parent path `userId`.
4. Document IDs must conform to `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
5. Updates cannot modify immutable identity fields (`uid`, `userId`, `createdAt`).
6. All collection queries must evaluate `resource.data` against `request.auth.uid` to prevent unauthorized query scraping.

## 2. The Dirty Dozen Payloads (Forbidden Operations)
1. **Unauthenticated Read**: Attempting to read `/users/student123` with `request.auth == null` -> DENIED.
2. **Cross-User Snooping**: User `studentA` attempting to read `/users/studentB` -> DENIED.
3. **Ghost Field Injection**: User trying to write `{ uid: 'studentA', email: 'a@test.com', isAdmin: true }` -> DENIED.
4. **Unverified Email Write**: User with `request.auth.token.email_verified == false` attempting to write an exam attempt -> DENIED.
5. **ID Poisoning Attack**: Writing to `/users/../../malicious/path` or using an oversized (>128 char) ID -> DENIED.
6. **Identity Spoofing**: User `studentA` attempting to create an attempt with `userId: 'studentB'` -> DENIED.
7. **Array Bombing**: Submitting a `completedLessons` array with >100 entries or elements exceeding 128 chars -> DENIED.
8. **Negative Score Exploit**: Submitting an `ExamAttempt` with negative score or percentage > 100 -> DENIED.
9. **Blanket Collection Scraping**: Querying `/users/{userId}/attempts` without matching the authenticated student -> DENIED.
10. **Immutable Field Tampering**: Updating an existing `UserProfile` to change `uid` or `createdAt` -> DENIED.
11. **Catch-All Probe**: Attempting to read or write to any undefined path like `/system_configs` -> DENIED.
12. **Subcollection Orphan Attack**: Writing to `/users/{userId}/progress/{id}` when `request.auth.uid != userId` -> DENIED.
