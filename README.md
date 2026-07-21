# Car Dealership Inventory System

TDD kata-style build. Django REST API backend, React frontend.

## Structure
```
backend/     Django project (config, accounts, vehicles, transactions apps)
frontend/    React app (components, pages, context, api service layer)
```

## Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Run the first RED test
```bash
pytest accounts/tests/test_models.py -v
```
This should currently **fail** — `User.role` and `User.Role` don't exist yet.
That's step 1 of the TDD cycle.

### TDD cycle from here
1. RED — run the failing test above, confirm it fails for the *expected* reason.
2. GREEN — open `accounts/models.py` and add just enough (a `role` CharField
   with `Role.ADMIN` / `Role.CUSTOMER` choices, an `is_admin` property,
   and a `__str__` returning email) to make the 5 tests pass.
3. Run `python manage.py makemigrations accounts && python manage.py migrate`.
4. REFACTOR if needed, then move to `accounts/urls.py` + views for
   register/login (see TODO comments in that file).
5. Repeat the cycle for `vehicles/` (Phase B) then `transactions/` (Phase C) —
   TODO comments in each app's `models.py`/`tests/test_models.py` outline
   the next tests to write.

## Frontend setup
```bash
cd frontend
npm install
```

### Run the first RED test
```bash
npm test -- --watchAll=false src/__tests__/LoginForm.test.js
```
This should currently **fail** — `LoginForm` renders `null`.

### TDD cycle from here
1. RED — confirm the test above fails.
2. GREEN — implement `src/components/auth/LoginForm.js` with labeled
   email/password inputs and a "Log in" button, just enough to pass.
3. Add the next test (`shows error on invalid login`) and repeat.
4. Wire up `src/api/auth.js` once the backend login endpoint exists.

## Build order (see project breakdown for full detail)
1. Auth backend → 2. Auth frontend → 3. Vehicle backend (CRUD + search)
   → 4. Vehicle dashboard frontend → 5. Purchase/restock backend
   → 6. Purchase UI + admin forms
