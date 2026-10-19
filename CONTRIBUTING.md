# Contributing to OpenAgenticUI

Thank you for your interest in contributing to **OpenAgenticUI**! Whether it's fixing a bug, adding a new agentic component, or improving documentation, your help is appreciated.

## How to Add a Component

1. **Create the component file:**
   Add your standalone React component inside `components/agentic/[slug].tsx`. Ensure it uses pure Tailwind CSS, TypeScript, and `clsx` / `tailwind-merge` via `lib/cn.ts`.

2. **Register the metadata:**
   Open `lib/registry/index.ts` and add your component metadata and AI integration instructions to the `REGISTRY` array.

3. **Test locally:**
   Run `npm run dev` and navigate to `http://localhost:3000/components/[slug]` to verify your live interactive preview and setup instructions.

4. **Submit a Pull Request:**
   Push your branch and open a pull request on GitHub detailing the problem your component solves or the enhancement you've introduced.