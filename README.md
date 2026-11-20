# LokSeva AI

A Marathi-language workspace for Maharashtra revenue officers processing income certificate applications. When intake records, document copies, and verification notes sit in different places, field staff spend time finding what is missing and deciding which case to handle first. Delays and unclear correction requests can mean another visit for an applicant who needs the certificate for a scholarship or fee concession.

## Workflow

Maharashtra’s Aaple Sarkar procedure lists a 15-day service window. Applicants submit identity and address evidence, income details and supporting attachments, and a declaration. A tehsil clerk reviews the submission, an Awwal Karkun reviews it next, and the Nayab Tahsildar issues the digitally signed certificate after approval. Reviewers can request corrections with remarks. LokSeva groups those checks into four screens for a single officer account and models a 15-calendar-day deadline from submission. Fees, role-based hand-offs, certificate issuance, and appeals are outside the prototype’s scope. [Aaple Sarkar income certificate procedure and checklist](https://aaplesarkar.mahaonline.gov.in/pdf/Fees%2C%20Procedure%2C%20Checklist_Income%20Certificate.pdf)

| Stage | Officer action | How assistance helps |
| --- | --- | --- |
| Application intake | Confirm applicant details, address, and purpose. | Suggest which fields to collect or cross-check before beginning review. |
| Document verification | Open each uploaded file and record its result. The officer can continue to income review with missing files. | Prioritize evidence that is missing or unresolved so the officer can request specific corrections. |
| Income verification | Check sources, amounts, and the reporting period, then record verified income and a remark. | Suggest what to compare and surface a recorded mismatch for manual review. |
| Final decision | Review verification and history, then approve, reject, or return for correction. Approval and rejection require completed checks. | Summarize outstanding checks and propose an editable follow-up note. The officer records the decision. |

The dashboard highlights overdue and approaching deadlines. Returned applications can be corrected and resubmitted. The workflow restarts at the earliest affected stage. The history records the officer, action, status change, timestamp, and remarks.

## Measuring impact

Run a pilot in one office using comparable batches before and after adoption. Group applications by whether their documents were complete at intake so a change in case mix does not skew the comparison.

- Measure median time from submission to final decision, share completed by the due date, and how many overdue applications are still open using application and audit timestamps.
- Measure how many cases return for correction more than once. Review a sample of correction notes for whether they explain exactly which evidence to bring.
- Time common tasks on phones and desktops, including finding the next urgent case and recording a verification result. Ask officers whether the Marathi labels and suggestions are clear. For a sample of AI suggestions, record which officers used, edited, or discarded and check that no suggestion claimed a verification had occurred.

The priority queue should make urgent cases easier to find. Evidence grouped by category and specific follow-up notes should reduce repeat correction cycles. These are pilot hypotheses.

## Technical decisions

- Next.js and TypeScript render the Marathi officer workspace. The Express API owns validation and state transitions. The browser uses an HttpOnly session cookie and the API validates the officer session.
- PostgreSQL stores applications, uploaded documents, and audit entries. Each transition and its audit entry commit together, and a record version rejects stale edits. File uploads accept PDF, JPEG, and PNG up to 768 KB each.
- On request, the backend sends the current stage, missing field names, document category statuses, and checklist and discrepancy flags to the OpenAI Responses API. It sends no names, contact details, file names, addresses, free-text notes, exact income amounts, or file contents. Summaries and discrepancies are derived locally. The model produces Marathi follow-up suggestions and a draft remark in a validated JSON format. The UI identifies the source and uses local rules when the model is unavailable or a key is absent. Use synthetic applicant data for the assignment demo. [OpenAI Responses API quickstart](https://developers.openai.com/api/docs/quickstart)

## Run locally

Keep the frontend and `lokseva-backend` in sibling directories. Use Node.js 24+ and PostgreSQL. Create a local database called `lokseva_db` or use your existing database name and credentials in the backend's `DATABASE_URL`.

From the backend directory:

```sh
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

The seed command creates the demo officer from `DEMO_OFFICER_EMAIL` and `DEMO_OFFICER_PASSWORD`. Set both to dedicated demo values. Only officer-created applications appear until you explicitly load fictional fixtures with `npm run seed -- --with-applications`. Set `OPENAI_API_KEY` in the **backend** `.env` to enable model-generated guidance. `OPENAI_MODEL` defaults to `gpt-6.1-terra`. Restart the API after changing its environment.

From the frontend directory:

```sh
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000 and sign in with the seeded officer credentials. The frontend uses `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`. The backend uses `FRONTEND_ORIGIN=http://localhost:3000` and `PUBLIC_API_URL=http://localhost:5000/api`. Use the same hostname on both ports.

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` in the frontend. In the backend, set `TEST_DATABASE_URL` to a disposable PostgreSQL database and run `npm test`.
