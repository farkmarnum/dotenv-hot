import fs from 'fs';

export const isTypescript = () => fs.existsSync('tsconfig.json');
