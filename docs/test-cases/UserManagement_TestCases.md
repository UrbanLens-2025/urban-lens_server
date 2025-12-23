# User Management Test Cases

## Test Case UM-10: Admin View All Accounts

**ID:** UM-10

**Test Case Description:** Admin View All Accounts

**Test Case Procedure:**

1. Login as Admin.
2. Navigate to "All Accounts".
3. Filter by Role = "USER" (or "BUSINESS_OWNER", "EVENT_CREATOR").
4. Search by email or name.

**Expected Results:**

- Displays a paginated list of all accounts matching the filters.
- Shows account details: email, name, role, status, onboarding status.
- Search functionality returns accounts matching the query.

---

## Test Case UM-11: Admin Send Warning to User

**ID:** UM-11

**Test Case Description:** Admin Send Warning to User

**Test Case Procedure:**

1. Login as Admin -> Navigate to "All Accounts".
2. Search for a User (or Business Owner/Event Creator).
3. Click on the account to view details.
4. Navigate to "Warnings" section.
5. Click "Send Warning" and enter warning message.
6. Submit the warning.

**Expected Results:**

- Warning is successfully created and associated with the account.
- Warning appears in the account's warning history.
- User receives notification about the warning.
- Warning details are visible in the account's warnings list.

---

## Test Case UM-12: Admin Lift Account Suspension

**ID:** UM-12

**Test Case Description:** Admin Lift Account Suspension

**Test Case Procedure:**

1. Login as Admin -> Navigate to "All Accounts".
2. Search for a suspended account (filter by isLocked = true).
3. Click on the account to view details.
4. Navigate to "Suspensions" section.
5. Select an active suspension.
6. Click "Lift Suspension".

**Expected Results:**

- Suspension status updates to inactive (is_active = false).
- Account status updates to unlocked (isLocked = false).
- User can now login and perform API actions.
- Suspension history shows the lifted suspension with updated status.
