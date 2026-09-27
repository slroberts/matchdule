/**
 * Shared match timing — plain module (NO 'use client') so both the server-side
 * API mapper and client hooks can import real values.
 */

/** Regulation play used for conflict / tight-gap math */
export const MATCH_PLAY_MINUTES = 90;

/** Status window: kickoff → full time (+ buffer). After this the game is over. */
export const MATCH_LENGTH_MS = 105 * 60_000;
