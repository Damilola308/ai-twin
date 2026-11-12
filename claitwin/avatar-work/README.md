# THE CURIOUS LAB

A Next.js portfolio for Opeyemi Ogunbona, with an editorial design system and a dedicated AI twin experience.

## Included
- Responsive portfolio homepage and sidebar navigation
- About, Work, Experiments, Notes, Contact and dynamic project case-study routes
- Six documented design concepts: Pawluck, Ona, Ajo, Hallchop, Cura HMO and Rapada
- Central profile and project data in `data/profile.ts` and `data/projects.ts`
- Dedicated `/twin` route with text conversation, browser voice input/output and explicit AI disclosure
- Server-side `/api/twin` route with a grounded knowledge base in `data/twin-knowledge.ts`
- `.env.example` and `TWIN_SETUP.md` for configuration and deployment

## Run locally
1. Install Node.js 20 or later.
2. Extract the ZIP and open the project folder in a terminal.
3. Run `npm install`.
4. Optionally copy `.env.example` to `.env.local` and add an OpenAI API key for live AI responses.
5. Run `npm run dev`.
6. Open http://localhost:3000 and http://localhost:3000/twin.

Without an API key, `/twin` uses a limited preview-answer mode. Voice input requires browser support and microphone permission. Spoken playback uses the browser's installed speech voices.

## Deploy
Push the updated project to the Git repository connected to your existing Vercel project. Add `OPENAI_API_KEY` as a server-side Vercel environment variable, then redeploy. See `TWIN_SETUP.md` for step-by-step instructions and limitations.

## Important asset status
The supplied portrait is included as a clearly labelled 2D visual reference. It is not a 3D model. A custom rigged `.glb`/`.gltf` character asset with facial expressions and idle/speaking animations is still required for the production 3D avatar.
