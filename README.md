# Test Automation Suite (Playwright + Cucumber + TypeScript)

This repository contains automated UI tests built using:

- Playwright
- Cucumber / Gherkin
- TypeScript
- Page Object Model (POM) structure

The tests are written to support repeatable, stable execution in:
- Local development environments (Windows, macOS, Linux)
- CI pipelines (GitHub Actions, GitLab CI, Jenkins, etc.)

---

## Folder Structure

```
.
├── features/          # Gherkin feature files
├── steps/             # Step definition files
├── pages/             # Page Object classes
├── utils/             # Shared utilities/helpers
├── test-data/         # Input files used in tests (e.g., pdf, jpg, etc.)
├── configs/           # Report configuration scripts
├── reports/           # Test execution reports (auto-created)
├── .env               # Environment variables (not committed)
└── package.json
```

---

## Requirements

| Dependency | Version / Notes |
|-----------|----------------|
| Node.js   | v16+ recommended |
| npm       | included with Node |
| Playwright browsers | installed via command below |

---

## Installation & Setup

**Clone the repository:**

```bash
git clone <repo-url>
cd <repo-folder>
```

**Install all dependencies:**

```bash
npm install
```

**Install additional type definitions and tools:**

```bash
npm i -D @types/chai @types/node @types/node-fetch @types/mocha
npm i node-fetch@2
npm install dotenv
npm install --save-dev npm-run-all
npm install -D @playwright/test
```

**Install Playwright browsers:**

```bash
npx playwright install
```

Note: On Linux CI or fresh build agents:

```bash
npm run playwright:install
```

This ensures missing Playwright dependencies are installed as well.

### Environment Variables


### Environment Variables

Create a `.env` file in the project root and set the following keys as needed:

```
PWDEBUG=
HEADLESS=
SLOWMO=
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
FLEET_ADMIN_EMAIL=
FLEET_ADMIN_PASSWORD=
SECOND_USER_EMAIL=
SECOND_USER_PASSWORD=
BASE_URL=
EMPTY_STATE_EMAIL=
EMPTY_STATE_PASSWORD=
ADMIN_BASE_URL=
ADMIN_TEST_USER_EMAIL=
ADMIN_TEST_USER_PASSWORD=
```

> Tip: You can copy the above block into your `.env` file and fill in the values as needed.

### Test Data

Place any required upload files (PDFs, images, etc.) into:

```
test-data/
```

Example files already used in flows:
- `test-data/sample.pdf`
- `test-data/sample.jpg`

---

## Running Tests

**Standard Test Run (Headless)**

```bash
npm test
```

**Run Tests with Browser UI (Debug mode)**

```bash
npm run test:headed
```

**Generate HTML Report Manually**

```bash
npm run report:gen
```

Reports are saved to:

```
reports/cucumber-report.html
```

**Typical Windows Debug Example**

```powershell
$env:PWDEBUG = '0'; $env:HEADLESS = '0'; npm test -- features/profile.feature
```

### CI Execution

For CI use the provided script:

```bash
npm run test:ci
```

This runs:
1. Cucumber tests
2. Report generation

Resulting artifacts are stored in `/reports`.

---

## Adding New Tests

1. Create or update a `.feature` file in `/features`
2. Add or extend step definitions in `/steps`
3. Add/reuse Page Object functions in `/pages`
4. Run tests to verify

Keep locators and UI interaction logic inside Page Objects, not steps.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Browsers missing | `npx playwright install` |
| Report not generated | `npm run report:gen` |
| Environment variables missing | Check `.env` file exists and is correct |

---

## Notes

- Each scenario runs in a fresh browser context
- Screenshots are automatically captured on failure
- Reports folder is auto-created before test execution
