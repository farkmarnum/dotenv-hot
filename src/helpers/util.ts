import fs from 'fs';
import chalk from 'chalk';
import {
  ENV_FROM_FILE_FILENAME,
  GITATTRIBUTES_COMMENT_PREFIX,
  GITATTRIBUTES_FILE,
  PACKAGE_NAME,
} from './constants';

export const showWarning = (msg: string) => {
  console.error(
    `${chalk.red('ERROR:')} ${chalk.yellow(
      msg,
    )} -- have you run ${chalk.cyanBright(`npx ${PACKAGE_NAME} install`)} yet?`,
  );
};

export const getDataFromGitattributes = () => {
  let gitattributes: string = '';

  try {
    gitattributes = fs.readFileSync(GITATTRIBUTES_FILE, 'utf-8');
  } catch (err) {
    if ((err as Record<string, string>).code === 'ENOENT') {
      showWarning(`Could not find ${GITATTRIBUTES_FILE}`);
      process.exit(1);
    }
  }

  const attributePattern = RegExp(
    `^(?<envModuleDir>.*)${ENV_FROM_FILE_FILENAME} filter=(.*)`,
    'm',
  );
  const commentPattern = RegExp(
    `^${GITATTRIBUTES_COMMENT_PREFIX} script=(?<scriptsDir>.*)`,
    'm',
  );
  const attributeMatch = gitattributes.match(attributePattern);
  const commentMatch = gitattributes.match(commentPattern);

  if (
    !attributeMatch ||
    !attributeMatch.groups ||
    !attributeMatch.groups.envModuleDir ||
    !commentMatch ||
    !commentMatch.groups ||
    !commentMatch.groups.scriptsDir
  ) {
    console.error(
      `ERROR: could not the relevant data in ${GITATTRIBUTES_FILE}`,
    );
    process.exit();
  }

  const { envModuleDir } = attributeMatch.groups;
  const { scriptsDir } = commentMatch.groups;

  return { envModuleDir, scriptsDir };
};
