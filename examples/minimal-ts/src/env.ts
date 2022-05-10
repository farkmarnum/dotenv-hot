/**
 * This module lets us import variables from .env (via .envFromFile.ts) with a fallback on process.env.
 *  - In development, this loads new values in a way that is compatible with hot reloading.
 *  - In production, .envFromFile.ts will be empty, so we'll just be relying on process.env.
 */
import envFromFile from './.envFromFile';

/**
 * To ingest values from .env in prod, run 'yarn add dotenv' add uncomment the code below.
 */
// import dotenv from 'dotenv';
// if (process.env.NODE_ENV === 'production') {
//   dotenv.config();
// }

/**
 * NOTE: when adding environment variables, add a new line like this to export the variable:
 *   export const VAR_NAME = envFromFile.VAR_NAME || process.env.VAR_NAME;
 */

export const BOTTLES = envFromFile.BOTTLES || process.env.BOTTLES;
