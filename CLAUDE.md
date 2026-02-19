# IronLog - Workout Tracker

## Project Overview
IronLog is a workout tracking app built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth), and the Anthropic SDK for AI-powered routine generation. UI components use Radix UI / shadcn.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Architecture
- **Framework**: Next.js 16 with App Router, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with `tw-animate-css`
- **Database**: Supabase Postgres with Row Level Security. Exercises and workouts are stored as JSONB columns.
- **Auth**: Supabase Auth
- **AI**: Anthropic SDK (`claude-sonnet-4-5-20250929`) for routine generation
- **Path alias**: `@/*` maps to `./src/*`

## Project Structure
```
src/
  app/
    (app)/          # Authenticated routes (dashboard, log, routines, history, progress)
    (auth)/         # Auth routes (login)
  components/       # Shared components (exercise-picker, empty-state, ui/)
  lib/
    ai/prompts.ts   # AI prompt builder for routine generation
    constants/      # Static data (exercise catalog with descriptions)
    supabase/       # Supabase client (server + client)
    calculations.ts # Progressive overload suggestion logic
    offline-queue.ts / sync-workouts.ts  # Offline-first support
  types/database.ts # All TypeScript interfaces
supabase/
  migrations/       # Database schema (single migration file)
```

## Code Conventions
- All components use `"use client"` or `"use server"` directives as appropriate
- Server actions live in `actions.ts` files next to their route
- TypeScript interfaces live in `src/types/database.ts`
- Static exercise data (names, descriptions, muscle groups) lives in `src/lib/constants/exercises.ts`
- Use `@/` path alias for all imports
- Tailwind classes use arbitrary values in brackets (e.g., `text-[16px]`, `rounded-[14px]`)
- ESLint config: `eslint-config-next` with core-web-vitals and TypeScript rules

## Key Patterns
- Routines store exercises as JSONB arrays of `RoutineExercise` objects (`name`, `defaultSets`, `defaultReps`, optional `description`)
- Workouts store exercises as JSONB arrays of `WorkoutExercise` objects (`name`, `sets[]`)
- `DEFAULT_EXERCISES` is the static exercise catalog: `Record<string, ExerciseInfo[]>` grouped by muscle group, each with `name` and `description`
- AI-generated routines include exercise descriptions; the prompt instructs the model to return descriptions in the JSON
- Exercise descriptions are short (one sentence) describing the movement pattern
