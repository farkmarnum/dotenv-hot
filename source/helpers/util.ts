import fs from 'fs';
import chalk from 'chalk';
import { WORKING_DIR } from './constants';

export const quit = (msg: string) => {
  console.error(`${chalk.red.bold('ERROR:')} ${msg}\n`);
  process.exit(1);
};

export const isTypescript = () => fs.existsSync(`${WORKING_DIR}/tsconfig.json`);