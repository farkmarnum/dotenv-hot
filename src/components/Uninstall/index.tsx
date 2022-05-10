import fs from 'fs';
import path from 'path';
import { useEffect } from 'react';
import { getDataFromGitattributes } from '../../helpers/util';
import { removeGitFilter } from '../../helpers/git';
import {
  ENV_FROM_FILE_FILENAME,
  ENV_MODULE_FILENAME,
  GITATTRIBUTES_FILE,
  GIT_FILTER_SCRIPT_FILENAME,
} from '../../helpers/constants';

const uninstall = () => {
  try {
    removeGitFilter();
    console.log('· ✅ removed git filter');
  } catch {
    console.warn('· 🤔 WARNING: was not able to remove git filter');
  }

  const { envModuleDir, scriptsDir } = getDataFromGitattributes();

  [
    path.resolve(envModuleDir, ENV_FROM_FILE_FILENAME),
    path.resolve(envModuleDir, ENV_MODULE_FILENAME),
    path.resolve(scriptsDir, GIT_FILTER_SCRIPT_FILENAME),
    GITATTRIBUTES_FILE,
  ].forEach((filename) => {
    try {
      fs.unlinkSync(filename);
      console.log(`· ✅ removed ${filename}`);
    } catch (err) {
      if ((err as Record<string, string>).code === 'ENOENT') {
        console.warn(`· 🤔 WARNING: could not find ${filename}`);
      } else {
        throw err;
      }
    }
  });

  console.log('Done!');
};

const Uninstall = () => {
  useEffect(uninstall, []);

  return null;
};

export default Uninstall;
