# Sign‑In / Sign‑Out Flow: First Draft

This document outlines a first draft of the end‑to‑end authentication strategy for our NEAR‑based dApp (SudoStake). It covers the main UX states, user actions, and error‑handling considerations.

## 1. Initial App Load

| State       | UI                          | Next Steps                               |
|-------------|-----------------------------|------------------------------------------|
| Unknown     | **Loading…** button state  | Initialize wallet selector & load session|
| Determined  | **Connect Wallet** or **Logout [ID]**| User can trigger sign‑in or sign‑out      |

## 2. Unauthenticated → Sign‑In Flow

1. **User clicks Connect Wallet**
   - Disable button and show spinner/“Redirecting…”
   - Call `signIn()` from wallet hook (redirect or popup)

2. **Wallet Interaction**
   - User chooses/creates NEAR account and grants permissions
   - Outcomes:
     - **Success:** Redirect back with auth data
     - **Cancel:** Show toast “Sign‑in cancelled”
     - **Error:** Show retry option + error message

## 3. Processing the Redirect

1. Wallet hook reads URL params, verifies nonce, and persists credentials
2. React effect updates button label from **Connect Wallet** → **Logout [accountId]**

## 4. Authenticated UX

- Guard sensitive routes/components (HOC or `useRequireAuth`)
- Show account menu / profile options
- Listen to external wallet changes and sync state

## 5. Sign‑Out Flow

1. **User clicks Logout [ID]**
   - (Optional) Confirm dialog
   - Call `signOut()` from wallet hook
2. Clear session, reset state → **Connect Wallet** button

## 6. Error‑Handling & Edge Cases

| Scenario                           | Handling                                    |
|------------------------------------|---------------------------------------------|
| Network error on sign‑in           | Toast “Network error, please retry”         |
| Popup blocked by browser           | Fallback to full‑page redirect               |
| Session expires / key revoked      | Auto‑logout + notice                        |
| External account switch            | Sync via wallet‑selector events             |

## 7. Next Steps & Enhancements

- Add loading skeletons for protected content
- Persist “remember me” for longer sessions
- Support multi‑account switching
- Integrate analytics on auth success/fail
