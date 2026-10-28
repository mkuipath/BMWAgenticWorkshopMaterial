export type FileKind = 'pdf' | 'mp4' | 'csv' | 'zip' | 'txt' | 'md' | 'html';

export interface Material {
  /** File name shown to participants and used for the saved file. */
  name: string;
  /** Path inside the BMW-Workshop-Materials bucket. */
  path: string;
  kind: FileKind;
  size: string;
  description: string;
  /** Optional heading the file is grouped under on the topic page. */
  group?: string;
  tag?: string;
  /** Shown as a red "Required" label when true, grey "Optional" when false. */
  required?: boolean;
  /** Files that open in a browser tab get a Preview button. */
  previewable?: boolean;
}

export interface Prereq {
  key: string;
  title: string;
  text: string;
}

export interface SetupStep {
  title: string;
  intro?: string;
  code?: string;
  /** Render the "Your values" form inside this step. */
  valuesForm?: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  kind: 'prompt' | 'terminal';
  intro?: string;
  text: string;
  after?: string;
  /** Long prompts start collapsed. */
  collapsed?: boolean;
  badge?: string;
}

export interface Topic {
  id: string;
  number: number;
  title: string;
  scenario: string;
  short: string;
  overview: { summary: string; tiles: Array<{ label: string; text: string }> };
  prerequisites: Prereq[];
  setup?: SetupStep[];
  materials: Material[];
  downloadAll?: Material;
  materialsIntro?: string;
  prompts: Prompt[];
  promptsIntro?: string;
  deploy?: { intro: string; code: string };
  /** Short note for the rail explaining which sections this topic does not have. */
  noteWhenMissing?: string;
}

export const WORKSHOP = {
  title: 'BMW Agentic Automation Workshop',
  eyebrow: 'UiPath Agentic Automation · Hands-on workshop',
  lead: 'Five topics, run in order. Open a topic to find its prerequisites, setup steps, files and prompts. Only the sections a topic needs are shown.',
  date: 'Workshop day',
  location: 'BMW',
  facilitator: 'Ask a facilitator in the room',
};

const CLI_SETUP = `npm i -g @uipath/cli                        # UiPath CLI
uip tools install @uipath/codedapp-tool     # build / pack / publish / deploy
uip tools install @uipath/orchestrator-tool # folder lookup
uip skills install                          # pick your coding agent`;

export const TOPICS: Topic[] = [
  {
    id: 'cartographer',
    number: 1,
    title: 'Cartographer',
    scenario: 'Ardenfield Mutual · ClaimCore',
    short: 'Turn a recorded manual claims-intake process into a Process Definition Document that names the right tool for every step.',
    overview: {
      summary:
        'Watch a claims handler register a homeowners water-damage claim by hand in ClaimCore, then run Cartographer on the recording to produce the process map and PDD. Compare your result with the reference PDD and mark the steps that need UI automation. Topic 3 builds one of them.',
      tiles: [
        { label: 'Scenario', text: 'Ardenfield Mutual claims intake in ClaimCore.' },
        { label: 'Input', text: 'manual-claim-intake.mp4 plus the desk notes and policy wording.' },
        { label: 'Expected output', text: 'A PDD close to claims-pdd.md.' },
      ],
    },
    prerequisites: [
      { key: 'c1-staging', title: 'Workshop org access.', text: 'Sign in to the UiPath organisation the facilitator shares and open the workshop tenant.' },
      { key: 'c1-carto', title: 'Cartographer enabled', text: 'on the tenant. The facilitator confirms this before the session.' },
      { key: 'c1-video', title: 'A video player', text: 'for the two MP4 recordings.' },
    ],
    materialsIntro: 'Recordings are large, so start those first.',
    downloadAll: {
      name: 'ClaimCore-Cartographer.zip',
      path: 'cartographer/ClaimCore-Cartographer.zip',
      kind: 'zip',
      size: '10.3 MB',
      description: 'Everything for this topic in one zip (without the UiBank warm-up recording).',
    },
    materials: [
      { group: 'Recordings', name: 'manual-claim-intake.mp4', path: 'cartographer/manual-claim-intake.mp4', kind: 'mp4', size: '10.1 MB', description: 'The as-is process: a claims handler registering a claim by hand in ClaimCore. This is the recording you map.', previewable: true },
      { group: 'Recordings', name: 'UiBank-ApplyForLoan-Steps-Recording.mp4', path: 'cartographer/UiBank-ApplyForLoan-Steps-Recording.mp4', kind: 'mp4', size: '4.4 MB', description: 'A shorter step recording from UiBank to warm up on first.', previewable: true },
      { group: 'Reference documents', name: 'claims-pdd.md', path: 'cartographer/claims-pdd.md', kind: 'md', size: '26 KB', description: 'The Process Definition Document for water-damage claim intake. Compare your result against it. Reused in Topic 3.', tag: 'Expected output', previewable: true },
      { group: 'Reference documents', name: 'policy-wording.pdf', path: 'cartographer/policy-wording.pdf', kind: 'pdf', size: '826 KB', description: 'Ardenfield Mutual homeowners policy wording. The coverage rules the triage step cites.', previewable: true },
      { group: 'Reference documents', name: 'claims-desk-notes.pdf', path: 'cartographer/claims-desk-notes.pdf', kind: 'pdf', size: '62 KB', description: 'Working notes from the claims desk: the undocumented rules a recording alone will not show.', previewable: true },
      { group: 'Sample claim forms', name: 'claim-form-CF-D7B8965C-G01.pdf', path: 'cartographer/claim-form-CF-D7B8965C-G01.pdf', kind: 'pdf', size: '333 KB', description: 'Home Claim Notification Form used in the recording.', previewable: true },
      { group: 'Sample claim forms', name: 'CF-HN3KETK4-S1.pdf', path: 'cartographer/CF-HN3KETK4-S1.pdf', kind: 'pdf', size: '94 KB', description: 'Second claim form, policy HO-HN3KETK4-001. Topic 3 uses it as the test input for RegisterClaim.', previewable: true },
    ],
    prompts: [],
    noteWhenMissing: 'No setup commands or prompts. Cartographer runs in the browser on the workshop tenant.',
  },
  {
    id: 'delegate',
    number: 2,
    title: 'Delegate',
    scenario: 'Meridian Logistics · payment processing',
    short: 'Hand a browser task to an agent: match supplier invoices to purchase orders in the Meridian Logistics practice app.',
    overview: {
      summary:
        'Open the Meridian Logistics practice app in your browser and let Delegate work it for you: read each supplier invoice, look up the purchase order, and record the match. One invoice has no matching PO on purpose, so you can see how the agent handles an exception.',
      tiles: [
        { label: 'Scenario', text: 'Meridian Logistics accounts payable: invoice to PO matching.' },
        { label: 'Input', text: 'Four invoice PDFs and the PO reference list.' },
        { label: 'Expected output', text: 'Three matched invoices recorded in the app and one flagged as unmatched.' },
      ],
    },
    prerequisites: [
      { key: 'c2-staging', title: 'Workshop org access.', text: 'Signed in to the workshop organisation.' },
      { key: 'c2-delegate', title: 'Delegate available', text: 'in your browser on the workshop tenant. The facilitator confirms this before the session.' },
      { key: 'c2-browser', title: 'Chrome or Edge', text: 'to open the practice app from your downloads folder.' },
    ],
    materialsIntro: 'Download the practice app and the invoices to a folder you can find again. The practice app is a single HTML page that runs locally in your browser.',
    downloadAll: {
      name: 'Meridian-Logistics-Delegate.zip',
      path: 'delegate/Meridian-Logistics-Delegate.zip',
      kind: 'zip',
      size: '17 KB',
      description: 'The practice app, the PO reference list and all four invoices.',
    },
    materials: [
      { group: 'Practice app', name: 'meridian-logistics-practice-app.html', path: 'delegate/meridian-logistics-practice-app.html', kind: 'html', size: '21 KB', description: 'The payment-processing practice app. Open it in your browser; it works offline.', tag: 'Open in browser' },
      { group: 'Practice app', name: 'meridian_logistics_po_reference.csv', path: 'delegate/meridian_logistics_po_reference.csv', kind: 'csv', size: '1 KB', description: 'Purchase order reference list the invoices should be matched against.' },
      { group: 'Supplier invoices', name: 'invoice_nimbus_office_supplies.pdf', path: 'delegate/invoice_nimbus_office_supplies.pdf', kind: 'pdf', size: '4 KB', description: 'Nimbus Office Supplies invoice. Has a matching PO.', previewable: true },
      { group: 'Supplier invoices', name: 'invoice_cascade_print_co.pdf', path: 'delegate/invoice_cascade_print_co.pdf', kind: 'pdf', size: '4 KB', description: 'Cascade Print Co invoice. Has a matching PO.', previewable: true },
      { group: 'Supplier invoices', name: 'invoice_brightpath_logistics.pdf', path: 'delegate/invoice_brightpath_logistics.pdf', kind: 'pdf', size: '4 KB', description: 'BrightPath Logistics invoice. Has a matching PO.', previewable: true },
      { group: 'Supplier invoices', name: 'invoice_unmatched_po.pdf', path: 'delegate/invoice_unmatched_po.pdf', kind: 'pdf', size: '4 KB', description: 'Invoice with no matching PO. Use it to see how the agent handles an exception.', tag: 'Exception case', previewable: true },
    ],
    prompts: [],
    noteWhenMissing: 'No setup commands or prompts. You describe the task to Delegate in your own words inside the browser.',
  },
  {
    id: 'coding-agents',
    number: 3,
    title: 'Coding Agents',
    scenario: 'ClaimCore · RegisterClaim',
    short: 'Build the RegisterClaim RPA process with an AI coding agent and the UiPath skills: first the ClaimCore login, then the new-claim wizard.',
    overview: {
      summary:
        'Drive an AI coding agent that has the UiPath skills installed to build a cross-platform RPA process, RegisterClaim, against the ClaimCore web UI. Prompt 1 builds only the login. Prompt 2 asks the agent to rewrite your rough request into a better prompt. Prompt 3 is the full specification for the new-claim wizard that the agent produced from it.',
      tiles: [
        { label: 'You build', text: 'RegisterClaim: ClaimCore login, then a NewClaim module that fills the four-step wizard from a claim-form PDF.' },
        { label: 'You use', text: 'A coding agent with the UiPath skills, Studio Desktop 25.10, Chrome, and the Ardenfield.ClaimCore.Library UI library.' },
        { label: 'You end with', text: 'A claim registered in the ClaimCore sandbox and one item in the ClaimCore queue.' },
      ],
    },
    prerequisites: [
      { key: 'c3-staging', title: 'Workshop org access', text: 'with the folder that holds the ClaimCore_BaseUrl asset, the ClaimCore_Login credential and the ClaimCore queue.' },
      { key: 'c3-agent', title: 'An AI coding agent', text: 'such as Claude Code or Cursor, signed in, with the UiPath skills installed (see the setup commands in Topic 4 if you have not done this yet).' },
      { key: 'c3-studio', title: 'Studio Desktop 25.10', text: 'signed in to the workshop tenant, with the UiPath browser extension in Chrome.' },
      { key: 'c3-lib', title: 'Ardenfield.ClaimCore.Library 1.2.0 (.nupkg)', text: 'downloaded locally. The facilitator shares it. Note the folder you save it to; the first prompt refers to that path.' },
      { key: 'c3-pdd', title: 'claims-pdd.md and CF-HN3KETK4-S1.pdf', text: 'from the Materials section below, saved next to your project.' },
    ],
    materialsIntro: 'The PDD and the test claim form come from Topic 1. The prompt text files are the same prompts shown in the Prompts section, for download if you prefer a file.',
    materials: [
      { group: 'Inputs', name: 'claims-pdd.md', path: 'cartographer/claims-pdd.md', kind: 'md', size: '26 KB', description: 'The Process Definition Document. Prompt 1 and Prompt 3 refer to rule R5 and section 8.', required: true, previewable: true },
      { group: 'Inputs', name: 'CF-HN3KETK4-S1.pdf', path: 'cartographer/CF-HN3KETK4-S1.pdf', kind: 'pdf', size: '94 KB', description: 'Test input for the NewClaim module: policy HO-HN3KETK4-001, Maya Okafor, EUR 2,400.00.', required: true, previewable: true },
      { group: 'Prompt files', name: 'RegisterClaim-1-Login-Prompt.txt', path: 'coding-agents/RegisterClaim-1-Login-Prompt.txt', kind: 'txt', size: '3 KB', description: 'Prompt 1 as a text file.', previewable: true },
      { group: 'Prompt files', name: 'RegisterClaim-2-NewClaim-ShortPrompt.txt', path: 'coding-agents/RegisterClaim-2-NewClaim-ShortPrompt.txt', kind: 'txt', size: '1 KB', description: 'Prompt 2 as a text file.', previewable: true },
      { group: 'Prompt files', name: 'RegisterClaim-3-NewClaim-FullPrompt.txt', path: 'coding-agents/RegisterClaim-3-NewClaim-FullPrompt.txt', kind: 'txt', size: '5 KB', description: 'Prompt 3 as a text file.', previewable: true },
    ],
    promptsIntro: 'Run the prompts in order. Each one tells the agent to show its plan and wait for your "go" before changing anything. Replace the library path in Prompt 1 with the folder where you saved the .nupkg.',
    prompts: [
      {
        id: 'p1',
        title: 'Build the ClaimCore login',
        kind: 'prompt',
        intro: 'Builds only the first part of RegisterClaim: open ClaimCore in Chrome, sign in with the Orchestrator credential, and confirm the claims worklist shows. The agent must plan first and wait for your go.',
        text: `Before you change anything, show me your plan and wait for my "go": the activities you will add, the arguments and variables, and the UI library elements you will use. Use only uipath studio desktop compatible packages. You can check uipath studio installed on this machine for details.

In the project RegisterClaim (a cross-platform project), build the first part of an RPA process that registers a claim in Ardenfield ClaimCore through its web UI, using UI Automation in Chrome: only the ClaimCore login. Do not build the new-claim wizard. ClaimCore has no API for registering claims: POST /api/v1/claims always returns 403 ClaimsRegistrationNotLicensed, so the UI is the only way (rule R5 in the attached claims-pdd.md).

Keep the project cross-platform: do not change its compatibility to Windows, and use only activities that support cross-platform.

Output: one argument named exactly claimNumber (no prefix, not out_claimNumber), left empty for now. No variable may have the same name.

Use the UI library in Ardenfield.ClaimCore.Library.1.2.0.nupkg which is available at path "<PATH_TO_YOUR_DOWNLOADS>\\ardenfield.claimcore.library.1.2.0.nupkg" for every ClaimCore screen and element:
install it into RegisterClaim from the folder it is in (a local NuGet source) and use its Object Repository elements. Do not capture or create new elements: its login elements are Username, Password and Login Submit. Use Ardenfield.ClaimCore.Library 1.2.0 exactly as it is: do not create, publish or bump a new version of it, and do not add elements to it.

Steps:
1. Read the ClaimCore address from the asset ClaimCore_BaseUrl and the login from the credential ClaimCore_Login, in the Orchestrator folder the process runs in: do not set a folder path. Never read credentials or addresses from files.
2. Use one Use Application/Browser card for the whole run: Chrome, a new incognito window every run, closed at the end. Never open, attach to or switch to a second browser window. Set the input method of every UI activity to Chromium API (or Simulate where Chromium API is not offered); never Hardware Events.
3. Open <ClaimCore_BaseUrl>/login, even if a session seems to exist.
4. Type the username and password from ClaimCore_Login into the library's Username (id username) and Password (id password), and click its Login Submit (id login-submit).
5. Check that ClaimCore shows the claims worklist, <ClaimCore_BaseUrl>/claims, with the button id new-claim-btn.

If ClaimCore shows a login error (id login-error), stop and throw a business exception with ClaimCore's message. Do not retry business exceptions (section 8 of the attached claims-pdd.md).

Signing in once is the test, and it is required. Do not publish or deploy anything. When you finish, validate and analyze the project, run it once from uipath studio desktop, and report: whether it signed in and the claims worklist showed, the activities and library elements you used, and anything you could not do or are unsure about.`,
        after: 'Attach claims-pdd.md to the conversation, or put it in the project folder, before sending.',
      },
      {
        id: 'p2',
        title: 'Ask the agent to rewrite your rough request',
        kind: 'prompt',
        intro: 'A deliberately rough prompt. The agent is asked to rewrite it properly first, then wait for two separate go-aheads: one for the plan, one for the workflow files. Compare its rewrite with Prompt 3.',
        text: `Before you change anything, show me your plan and wait for my "go": the activities you will add, the arguments and variables, and the UI library elements you will use. Use only uipath studio desktop compatible packages. You can check uipath studio installed on this machine for details.  Enhance this with another module in this project - New claim. This also has to be ui automation. Input will be an pdf file from a folder location, read policy number from this pdf, search for it, confirm, fill in other details from pdf file, submit it. COpy policy number and claim number, save the details in queue "ClaimCore". First re-write this prompt in a better way. After prompt re-write wait for my go ahead to generate the plan and then wait for another go ahead to generate the workflow files`,
      },
      {
        id: 'p3',
        title: 'Build the NewClaim module (full specification)',
        kind: 'prompt',
        intro: 'The full specification the agent produced from Prompt 2. Use it as-is if you want to skip the rewrite step, or to compare with the agent’s own rewrite.',
        collapsed: true,
        text: `Extend the existing cross-platform project RegisterClaim with a second module, NewClaim, that registers a homeowners water-damage claim in Ardenfield ClaimCore through the web UI (rule R5: POST /api/v1/claims always returns 403, so UI Automation is the only way). Keep the project Portable, keep every activity cross-platform, and use only packages that Studio 25.10 on this machine can load. Show the plan first and wait for "go"; after the plan is approved, wait for a second "go" before writing any workflow file.

Input

One input argument holding the full path of a Home Claim Notification Form PDF (test file: CF-HN3KETK4-S1.pdf, policy HO-HN3KETK4-001, Maya Okafor, loss 22 Oct 2026, appliance failure, kitchen, EUR 2,400.00).
Read the PDF text with a cross-platform PDF activity and parse these fields: form reference, policy number, phone, date of loss, time of loss (may be empty), peril, cause, location, "What happened" description, estimated amount. If policy number, date of loss or estimated amount is missing, throw a BusinessRuleException and stop (PDD §8, no retry).

Flow, all inside the ClaimCore browser session opened by the existing login

Login as already built (Main.xaml): asset ClaimCore_BaseUrl, credential ClaimCore_Login, no folder path, Chrome incognito, Chromium API input.
On the claims worklist, click New Claim and run the four-step wizard (PDD §4.1):
Step 1 Policy: type the policy number into the search box, search, confirm the policyholder and policy card.
Step 2 Loss details: date of loss, time of loss if present, peril, cause, location, description (20 characters or more), then Next.
Step 3 Amount: estimated amount in EUR, contact phone, claim form reference. Skip the optional attachment. Then Next.
Step 4 Review: tick the declaration, click Submit.
Read the new claim number (CLM- plus six digits) from the confirmation page and return it in the existing claimNumber output argument.
Add one item to the Orchestrator queue ClaimCore (same folder as the process, no folder path) with at least policyNumber, claimNumber and claimFormRef.
Close the browser (the existing card already does this).

Error handling

Any ClaimCore validation message in the wizard (policy not found, policy Lapsed, date of loss in the future or outside the policy period, amount outside 1 to 1,000,000, wizard summary errors) -> BusinessRuleException with ClaimCore's own text, no retry, instance fails as a business exception.
Browser or element not responding -> system exception; no custom retry inside this module.

UI library

Use Ardenfield.ClaimCore.Library 1.2.0 as it is, unchanged: never add elements to it, never republish or bump it. Use its Object Repository elements wherever they exist: New Claim; Step 2 (Loss Date, Loss Time, Peril, Cause, Loss Location, Loss Description, Wizard Next Step 2, Loss Date Error, Wizard Errors Step 2); Claim Created (Claim Number).
The library has no elements for Step 1 (policy search and confirm), Step 3 (amount, phone, claim form ref, Next) or Step 4 (declaration, Submit). Capture these into the project's own Object Repository from the live ClaimCore sandbox, using the UiPath capture tooling, never hand-written selectors.

Constraints

One browser window for the whole run. If NewClaim is a separate .xaml, its Use Browser card attaches to the already-open ClaimCore window (Open: Never, Close: Never) and never opens a second window.
Chromium API input on every UI activity, Simulate only where Chromium API is not offered, never Hardware Events.
Never read credentials or addresses from files. No publish, no deploy.

Test and report

Validate and build (uip rpa), run Studio 25.10's Workflow Analyzer, then run once from Studio Desktop with the S1 PDF. Expected: a real claim is registered in the sandbox in status REGISTERED, claimNumber is populated, and one item appears in queue ClaimCore.
Report: whether the claim was registered and which claim number, the queue item, the activities and library elements used, the elements newly captured, and anything not done or uncertain.

Assumptions to confirm

NewClaim is a separate workflow file NewClaim.xaml invoked from Main.xaml after the login check, with its own attach-only browser card. Alternative: a sequence inside Main.xaml's existing card.
Capturing the missing Step 1, 3 and 4 elements into the project's local Object Repository is acceptable, since the library must stay at 1.2.0.
PDF parsing uses a cross-platform "Read PDF Text" activity plus regular expressions, not IXP. IXP belongs to the extract_claim step of the orchestration, not this RPA module.
The queue ClaimCore already exists in the process folder. If it does not, I will stop and ask rather than create it.
Each run registers a new claim in the sandbox. A second run with the same PDF creates a second claim for the same loss, which Release 2's duplicate check is meant to catch. That is acceptable for the test run.`,
      },
    ],
  },
  {
    id: 'coded-app',
    number: 4,
    title: 'Coded App',
    scenario: 'support-ticket-dashboard · Data Fabric',
    short: 'Generate a support-ticket dashboard on a Data Fabric Tickets entity, run it locally, then deploy it to your Workspace or the Shared folder.',
    overview: {
      summary:
        'You prompt a coding agent to build a Coded Web App on top of a Data Fabric Tickets entity, run it locally with npm run dev, then deploy the same app to your Workspace or the Shared folder on the workshop tenant.',
      tiles: [
        { label: 'You build', text: 'support-ticket-dashboard: sign-in, sortable ticket table, search, detail panel.' },
        { label: 'You use', text: 'UiPath CLI, the codedapp tool, and a coding agent with the UiPath skills.' },
        { label: 'You end with', text: 'The dashboard open from Automation Cloud on the workshop tenant.' },
      ],
    },
    prerequisites: [
      { key: 'c4-staging', title: 'Workshop org access.', text: 'You can sign in to the workshop organisation and see your Workspace folder.' },
      { key: 'c4-node', title: 'Node.js LTS and npm.', text: 'Both commands in the block below print a version.' },
      { key: 'c4-agent', title: 'An AI coding agent', text: 'such as Claude Code or Cursor, signed in, with an empty project folder open.' },
      { key: 'c4-client', title: 'External application client ID', text: 'for the workshop organisation, shared by the facilitator.' },
      { key: 'c4-entity', title: 'Tickets entity', text: 'in Data Fabric with tickets-seed.csv imported, and its entity ID.' },
    ],
    setup: [
      {
        title: 'Check Node.js and npm',
        intro: 'Both commands must print a version.',
        code: `node --version
npm --version`,
      },
      {
        title: 'Install the CLI, the tools and the skills',
        intro: 'Run in a terminal. The last command asks which coding agent to wire the skills into; pick the one you will use today.',
        code: CLI_SETUP,
      },
      {
        title: 'Create the project and install dependencies',
        intro: 'Run in an empty folder that is open in your coding agent.',
        code: `npm create vite@latest support-desk-from-uipath-delegate -- --template react-ts
cd support-desk-from-uipath-delegate
npm install @uipath/uipath-typescript --@uipath:registry=https://registry.npmjs.org
npm install -D @uipath/coded-apps-dev --@uipath:registry=https://registry.npmjs.org
npm install -D tailwindcss@4 @tailwindcss/postcss postcss autoprefixer
npm install @uipath/apollo-wind @uipath/apollo-core --@uipath:registry=https://registry.npmjs.org
npm install next-themes lucide-react`,
      },
      {
        title: 'Enter your values',
        intro: 'Saved in this browser only. The prompts below fill their placeholders from these.',
        valuesForm: true,
      },
    ],
    materials: [
      { name: 'tickets-seed.csv', path: 'coded-app/tickets-seed.csv', kind: 'csv', size: '59 KB', description: 'Seed data for the Tickets entity. Columns: subject, description, customerEmail, assignee, status, priority, category, reasonForDelay, resolutionMinutes, OriginalCreatedTime.', required: true },
    ],
    promptsIntro: 'Highlighted values are replaced with what you saved in Setup. Copy a prompt and paste it into your coding agent.',
    prompts: [
      {
        id: 'p1',
        title: 'Build the dashboard',
        kind: 'prompt',
        intro: 'Describes the app type, the Data Fabric source, the UX and functionality, and the visual style.',
        text: `Build a Coded Web App called "support-ticket-dashboard".
I want to open the app, sign in, and see all the tickets my team is working on.

Connect to a Data Fabric Tickets entity:
    Org:        <YOUR_ORG_NAME>
    Tenant:     <YOUR_TENANT_NAME>
    Env:        Cloud
    Client ID:  <YOUR_CLIENT_ID>
    Entity ID:  <YOUR_ENTITY_ID>

Show one screen: a sign-in flow, then a sortable table of every ticket with the most useful columns (ticket subject, assignee, status, priority, category, age). Default sort: newest first. Each column header should be clickable to flip the sort. Also provide search on the subject column. Clicking a row in the table should open a side panel showing all the ticket's fields. For fields with file, display those files.

Give the app a modern enterprise dashboard feel: clean and minimal, but information-dense and operationally focused, similar to Linear, Stripe Dashboard, or modern Jira admin surfaces.`,
        after: 'When the agent finishes, run npm run dev and open http://localhost:5173.',
      },
      {
        id: 'p2',
        title: 'Deploy the app',
        kind: 'prompt',
        intro: 'Deploy the dashboard to the workshop tenant so it opens from your Workspace or the Shared folder.',
        text: `Now deploy the app to the <YOUR_FOLDER> folder (or my Workspace).`,
      },
    ],
    deploy: {
      intro: 'If you prefer the CLI to the deploy prompt, these are the equivalent steps on the workshop tenant.',
      code: `uip login -t "<YOUR_TENANT_NAME>"                   # opens the browser to sign in
npm run build                                       # produces dist/
uip codedapp pack dist -n "my-support-app"          # .uipath/*.nupkg
uip codedapp publish                                # uploads the package
uip or folders list --output json                   # find your folder key
uip codedapp deploy --folder-key <your-folder-key>  # deploy the app`,
    },
  },
  {
    id: 'maestro-flow',
    number: 5,
    title: 'Maestro Flow',
    scenario: 'PawsitiveVet · LabResultToScript',
    short: 'Build the LabResultToScript flow skeleton in five prompts: scaffold, stub the nodes, define LabCase, run once, then prove both gateways route.',
    overview: {
      summary:
        'Build the LabResultToScript flow skeleton for PawsitiveVet in five prompts. Every node starts as a stub, so you prove the wiring and both gateways before any node does real work. The prompts refer to the SDD, data contract and sample PDFs in the resources kit by path, so unzip the kit into your project folder first.',
      tiles: [
        { label: 'You build', text: 'A Maestro Flow project inside the PawsitiveVetLabProcessing solution, with a file-typed trigger and ten stub nodes.' },
        { label: 'You use', text: 'A coding agent with the uipath-maestro-flow skill, the UiPath CLI, and VS Code with the Maestro extension.' },
        { label: 'You end with', text: 'Three traced runs: the happy path, the rejected branch and the safety-gate branch.' },
      ],
    },
    prerequisites: [
      { key: 'c5-node', title: 'Node.js and npm', text: '(see Topic 4 setup).' },
      { key: 'c5-cli', title: 'UiPath CLI', text: 'signed in to the workshop tenant, with the skills installed (Topic 4 setup, step 2).' },
      { key: 'c5-agent', title: 'Coding agent', text: 'with the uipath-maestro-flow skill available.' },
      { key: 'c5-vscode', title: 'VS Code with the UiPath Maestro extension', text: 'signed in to the workshop tenant, for running the flow from the canvas.' },
      { key: 'c5-kit', title: 'The resources kit', text: 'unzipped into your project folder so that resources/ sits at its root.' },
    ],
    materialsIntro: 'The resources kit is required. PharmaDisp is a 71 MB Windows desktop app used later in the PawsitiveVet course; download it only if you want to continue after the workshop. VetChart, the web EMR, needs no download: the kit README has the hosted sandbox link.',
    materials: [
      { name: 'uipath-coding-agents-resources.zip', path: 'maestro-flow/uipath-coding-agents-resources.zip', kind: 'zip', size: '243 KB', description: 'SDD set (including lab-result-to-script-sdd.md), the PDD, the LabCase data contract, environment contract, and 64 sample lab-report PDFs.', required: true },
      { name: 'pawsitivevet-pharmadisp-windows.zip', path: 'maestro-flow/pawsitivevet-pharmadisp-windows.zip', kind: 'zip', size: '71 MB', description: 'PharmaDisp desktop pharmacy app, self-contained, Windows only. Not needed for the five prompts below.', required: false },
    ],
    promptsIntro: 'Run the prompts in order, one at a time, in the same agent conversation.',
    prompts: [
      {
        id: 'p1',
        title: 'Scaffold the Flow project',
        kind: 'prompt',
        intro: 'Creates the Flow inside the solution wrapper so it can be packaged and deployed, and declares the incoming report as a file input rather than plain text.',
        text: `Using the uipath-maestro-flow skill, scaffold a new Flow PROJECT named
"LabResultToScript" (the Flow instance name is also "LabResultToScript"), based on the
Flow SDD (lab-result-to-script-sdd.md - section 2 Flow Diagram and section 3 Nodes Inventory).
The Flow MUST live inside a SOLUTION WRAPPER, not on its own: create/\`uip solution init\`
a solution named "PawsitiveVetLabProcessing" and scaffold the Flow as a project inside it.
A bare \`flow init\` produces a standalone layout that later FAILS upload / pack / debug -
the solution wrapper is what makes the Flow packageable and deployable, and the other seven
projects join this same solution later.
Create the standard Flow project layout (project.json, flow_files/LabResultToScript.flow,
entry-points.json, bindings_v2.json). Add a manual trigger with a single input
\`reportFileRef\` declared as a FILE input (type:"file"), trigger-bound - NOT a String. This
is load-bearing: once configured, the IXP \`extract_report\` node consumes the downloaded file, and if
\`reportFileRef\` is a String the node fails at runtime with "downloadedFileOutput ... is a
String". Do not add any node logic yet; the next step stubs the nodes.`,
      },
      {
        id: 'p2',
        title: 'Stub every node in canonical order',
        kind: 'prompt',
        intro: 'Adds one placeholder node per process step. Each stub logs that it ran and passes the case object forward unchanged, so the wiring is proven before any real work.',
        collapsed: true,
        text: `Using the uipath-maestro-flow skill, add ONE node per process step to LabResultToScript,
each as a STUB that logs its own node key and returns the case object unchanged. Wire them
in the exact canonical order from the Flow SDD section 2/section 3:
  extract_report (IXP, inline) -> intake_validate (agent) -> check_intake_result (gateway)
  -> record_results (RPA) -> evaluate_recommend (agent) -> check_recommendation (gateway)
  -> draft_prescription (RPA) -> vet_review (HITL) -> sync_decision (API) -> notify_owner (connector) -> end
For the two gateways, wire ALL branches so every path is reachable from a stub:
  check_intake_result: "valid" -> record_results ; "rejected/junk/duplicate" -> audit end
  check_recommendation: "prescription indicated" -> draft_prescription ;
                        "no prescription needed" -> notify_owner ;
                        "safety gate triggered" -> vet_review (information-only) -> sync_decision -> end
Each stub sets a PLACEHOLDER value on its routing field so both gateways are testable
(e.g. intake stub sets Status="valid"; evaluate stub sets recommendation with
SafetyGateTriggered=false so the "prescription indicated" branch is taken by default).
Do not implement any real work - no IXP extraction, no agent calls, no UI automation.`,
      },
      {
        id: 'p3',
        title: 'Define the LabCase data contract',
        kind: 'prompt',
        intro: 'Defines the shared case object that travels through every node, with PascalCase scalars and camelCase test-value items as set in DATA-CONTRACT.md.',
        collapsed: true,
        text: `Using the uipath-maestro-flow skill, define the Flow variables and the shared data
contract from the Flow SDD section 4 Variables and Data Contract. The single "LabCase" object
travels between all nodes; the clinical output travels alongside as "recommendation".
LabCase fields (SCALARS ARE PascalCase - per resources/contracts/DATA-CONTRACT.md):
  ReportId, ReportDate, ClinicId, PatientId, PetName, Species, Breed, TestType,
  TestValues[], Priority, Status
where each TestValues[] item is camelCase (DELIBERATE asymmetry - array items differ
from the scalars above):
  { testName, resultValue, refRangeLow, refRangeHigh, unit, flag }
Companion Flow variables (INOUT unless noted):
  reportFileRef (IN, FILE - type:"file", trigger-bound; NOT a String) - the inbound PDF
  rawExtraction (Object)       - raw IXP extraction output (filled by extract_report later)
  labCase (Object)             - the verified LabCase above
  recommendation (Object)      - { Medication, Dosage, Rationale, Confidence, Escalate, SafetyGateTriggered }
  vetChartRxId (String)        - prescription ID returned after draft
  decision (String)            - Approved / Modified / Rejected
  decisionNotes (String)       - vet's notes
  syncResult (Boolean)         - whether the sync succeeded
Every stub reads \`labCase\` and passes it through unchanged; the routing stubs additionally
set \`labCase.Status\` and \`recommendation.SafetyGateTriggered\` as placeholders.`,
      },
      {
        id: 'p4',
        title: 'Run one hollow instance and inspect the trace',
        kind: 'prompt',
        badge: 'Needs PLR-2025-00006.pdf from the kit',
        intro: 'Runs the skeleton once with the sample report for patient Bella and shows the trace so every node is seen firing in order.',
        collapsed: true,
        text: `Using the uipath-maestro-flow skill, run one instance of LabResultToScript with a sample
input. Supply the \`reportFileRef\` FILE input from the canonical test PDF
\`resources/input-files/lab-results/PLR-2025-00006.pdf\` (from your downloaded course kit;
patient Bella / PV-10234) - the same report seeded into the LabReports bucket during setup.
Also seed a \`labCase\` for that report so the stubs have something to pass through. Show me
the trace so I can confirm every node fired in canonical order and the LabCase passed
through end to end. Then inspect \`labCase\` as it enters and leaves each node (a canvas
Probe, or the CLI element-execution records - see the note).
How you actually supply the file input depends on where you run it:
  - CANVAS (Maestro extension): the Run dialog prompts for the trigger inputs - pick the
    PLR-2025-00006.pdf above from the file picker for \`reportFileRef\`.
  - CLI / headless: pass the PDF on the command line, e.g.
      uip maestro flow debug --inputs '{"reportFileRef":"...PLR-2025-00006.pdf"}'
    (or the \`--attachment\` form the skill emits for a FILE-typed input). A repo-absolute path
    or the LabReports bucket ref both work; do NOT pass a bare filename.`,
      },
      {
        id: 'p5',
        title: 'Prove both gateways route',
        kind: 'prompt',
        intro: 'Runs the skeleton twice more with seed inputs to drive the rejected branch and the safety-gate branch, without editing the Flow between runs.',
        collapsed: true,
        text: `Using the uipath-maestro-flow skill, run the instance twice more to exercise the gateways.
Drive the branches WITHOUT editing the flow by passing per-run SEED trigger inputs - add
three optional trigger inputs \`seedStatus\` (String), \`seedSafetyGate\` (Boolean), and
\`seedMedication\` (String) that the intake/evaluate stubs copy onto \`labCase.Status\` /
\`recommendation.SafetyGateTriggered\` / \`recommendation.Medication\` when supplied (this is
the mechanism the reference build used - each run picks its branch from inputs, so you never
hand-edit stubs between runs):
1) Run with seedStatus = "rejected" -> confirm check_intake_result routes to the audit end
   and record_results never fires.
2) Run with seedSafetyGate = true -> confirm check_recommendation skips draft_prescription
   and routes to vet_review (information-only) -> sync_decision -> end.
Show me the trace for each so I can see the path differ.`,
      },
    ],
  },
];

export function topicById(id: string | undefined): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export type SectionId = 'overview' | 'prerequisites' | 'setup' | 'materials' | 'prompts' | 'deploy';

export interface SectionInfo {
  id: SectionId;
  label: string;
  count?: string;
}

/** The sections a topic actually has, in page order. */
export function sectionsOf(t: Topic): SectionInfo[] {
  const s: SectionInfo[] = [{ id: 'overview', label: 'Overview' }];
  if (t.prerequisites.length) s.push({ id: 'prerequisites', label: 'Prerequisites', count: String(t.prerequisites.length) });
  if (t.setup?.length) s.push({ id: 'setup', label: 'Setup', count: `${t.setup.length} steps` });
  if (t.materials.length) s.push({ id: 'materials', label: 'Materials', count: String(t.materials.length) });
  if (t.prompts.length) s.push({ id: 'prompts', label: 'Prompts', count: String(t.prompts.length) });
  if (t.deploy) s.push({ id: 'deploy', label: 'Deploy' });
  return s;
}
