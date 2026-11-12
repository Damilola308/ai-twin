# THE CURIOUS LAB — AI Twin setup

## What is included

- `/twin`: dedicated responsive AI-twin experience.
- `/api/twin`: server-side conversation endpoint. The OpenAI API key is read only on the server.
- `data/twin-knowledge.ts`: editable, public-safe knowledge source built from the approved brief and portfolio project data.
- `public/images/opeyemi-reference.png`: supplied portrait used as a clearly labelled 2D visual reference, not as a 3D avatar.
- `.env.example`: environment-variable template.

## Run locally

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` if you want live AI answers.
4. Add `OPENAI_API_KEY=your_key_here` to `.env.local`.
5. Optionally set `OPENAI_MODEL=gpt-6-luna`.
6. Run `npm run dev` and open `http://localhost:3000/twin`.
7. Run `npm run typecheck` and `npm run build` before deployment.

Without an API key, the twin runs in preview mode with a limited set of grounded answers. Preview mode does not call an external AI provider.

## Deploy to the existing Vercel project

1. Push the updated project to the Git repository connected to the existing Vercel project.
2. In Vercel, open Project Settings → Environment Variables.
3. Add `OPENAI_API_KEY` with the secret value. Add it to Production and Preview only if you want AI conversations in both environments.
4. Optionally add `OPENAI_MODEL` with `gpt-6-luna`.
5. Redeploy. Do not put the key in a `NEXT_PUBLIC_` variable, source file, or Git commit.
6. Visit `/twin` and test a project question, an unsupported question, and contact details.

## Services and costs

- OpenAI API: requires an API account and API billing. The default model is GPT-6 Luna, listed at $0.10 per 1 million input tokens and $0.50 per 1 million output tokens at the time this guide was prepared. Usage is token-based and depends on the knowledge context and response length; rates can change. The API is separate from a ChatGPT subscription. Check current rates at https://developers.openai.com/api/docs/pricing before enabling it.
- Speech recognition: uses the browser's Web Speech API where available. MDN marks SpeechRecognition as limited availability; browser support and language coverage vary. On some browsers, recognition audio is sent to a browser/platform speech service, so it may not be fully on-device or offline. Microphone access normally requires HTTPS (localhost is generally permitted). No separate speech-provider key is required for this browser-native implementation. Visitors are warned not to share sensitive information.
- Spoken playback: uses the browser's SpeechSynthesis API and installed voices. Voice quality and available accents depend on the visitor's operating system and browser. No voice cloning is used.
- Hosting: the existing Vercel plan and usage limits apply. The API route consumes serverless function resources.

## Current limitations and production hardening

- The rate limiter in this initial implementation is in-memory and instance-local. For robust abuse protection across serverless instances, add a shared rate-limit store such as Upstash Redis or a Vercel-supported equivalent.
- Knowledge retrieval currently injects the curated portfolio knowledge into the server-side prompt. A vector database is not required for this small knowledge base. If the corpus grows, add chunking, embeddings and source IDs.
- The API currently has no conversation persistence. Messages remain in the visitor's browser session state and are not saved to a user database by this code.
- A production 3D avatar still requires a custom rigged `.glb`/`.gltf` model with facial blendshapes and idle/talking animations. Add React Three Fiber/Three.js only when that asset is ready. The supplied portrait is not represented as 3D.
- Browser speech APIs are not uniformly supported. Visitors can always use text; voice controls gracefully report when speech input is unavailable.
- Before launch, consider adding a shared rate limiter, origin checks, monitoring, analytics consent and a clear privacy notice appropriate to your deployment.

## Updating the knowledge base

Edit `data/twin-knowledge.ts`. Keep facts, project details and boundaries accurate. Project content is sourced from `data/projects.ts`; update that canonical file when project details change. Do not add private notes or confidential documents to the public knowledge context.

## Interactive 3D avatar prototype

The `/twin` page now includes a procedural Three.js character prototype inspired by the supplied portrait. Install the added dependencies with `npm install`. The **Say hello** button triggers an arm-wave animation and browser-native spoken greeting. This is a first-pass stylized geometric character, not a professionally sculpted likeness or a facially rigged GLB model. Replace `components/TwinAvatar3D.tsx`'s procedural `Character` with a rigged GLB model when one is commissioned; keep the `sayHello` interaction and connect the wave to the model's animation mixer.

Speech uses the browser's built-in speech synthesis and does not require an API key. Voice availability and voice quality vary by browser and operating system.
