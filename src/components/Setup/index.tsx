import path from 'path';
import React, { useEffect, useState } from 'react';
import { Box, Text, Static, Newline, useApp } from 'ink';

import InitialConfirmation from '../InitialConfirmation';
import {
  checkForExistingEnvFromFile,
  checkForExistingEnvModule,
  writeEnvFromFileInit,
  writeEnvModuleInit,
} from '../../helpers/envModule';
import {
  checkForGitRepo,
  checkForCleanWorkingTree,
  createGitFilterScript,
  writeGitattributes,
  enableGitFilter,
  gitStageAll,
} from '../../helpers/git';
import {
  GIT_FILTER_SCRIPT_FILENAME,
  ENV_FROM_FILE_FILENAME,
  ENV_MODULE_FILENAME,
} from '../../helpers/constants';

const steps = [
  'initial-confirmation',
  'git-repo-check',
  'git-clean-check',
  'env-module-check',
  'env-module-create',
  'git-filter-script-create',
  'write-gitattributes',
  'git-filter-enable',
  'git-stage-all',
] as const;

type Step = typeof steps[number];

interface StepStatus {
  step: Step;
  status: 'succeeded' | 'failed';
}

const Setup = ({
  envModuleDir,
  scriptsDir,
  shouldSkipConfirmations,
}: {
  envModuleDir: string;
  scriptsDir: string;
  shouldSkipConfirmations: boolean;
}) => {
  const { exit } = useApp();

  const initialStep = shouldSkipConfirmations
    ? 'git-repo-check'
    : 'initial-confirmation';

  const [step, setStep] = useState<Step>(initialStep);
  const [stepsComplete, setStepsCompleted] = useState<StepStatus[]>([]);

  const markStepSucceeded = (s: Step) =>
    setStepsCompleted((curr) => [...curr, { step: s, status: 'succeeded' }]);

  const markStepFailed = (s: Step) =>
    setStepsCompleted((curr) => [...curr, { step: s, status: 'failed' }]);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const envFromFileFullpath = envModuleDir
    ? path.resolve(envModuleDir, ENV_FROM_FILE_FILENAME)
    : undefined;

  const envModuleFullpath = envModuleDir
    ? path.resolve(envModuleDir, ENV_MODULE_FILENAME)
    : undefined;

  // HANDLE STEP CHANGE:
  useEffect(() => {
    let nextStep: Step | undefined;
    let newErrorMessage: string | undefined;

    switch (step) {
      case 'initial-confirmation':
        break;

      case 'git-repo-check':
        newErrorMessage = checkForGitRepo();
        if (newErrorMessage) {
          setErrorMessage(newErrorMessage);
          markStepFailed(step);
        } else {
          markStepSucceeded(step);
          nextStep = 'git-clean-check';
        }
        break;

      case 'git-clean-check':
        newErrorMessage = checkForCleanWorkingTree();
        if (newErrorMessage) {
          setErrorMessage(newErrorMessage);
          markStepFailed(step);
        } else {
          markStepSucceeded(step);
          nextStep = 'env-module-check';
        }
        break;

      case 'env-module-check':
        if (!envModuleFullpath) throw new Error('no envModuleFullpath');
        if (!envFromFileFullpath) throw new Error('no envFromFileFullpath');

        newErrorMessage = checkForExistingEnvFromFile(envFromFileFullpath);
        if (!newErrorMessage) {
          newErrorMessage = checkForExistingEnvModule(envModuleFullpath);
        }

        if (newErrorMessage) {
          setErrorMessage(newErrorMessage);
          markStepFailed(step);
        } else {
          markStepSucceeded(step);
          nextStep = 'env-module-create';
        }
        break;

      case 'env-module-create':
        if (!envModuleFullpath) throw new Error('no envModuleFullpath');
        if (!envFromFileFullpath) throw new Error('no envFromFileFullpath');

        writeEnvFromFileInit(envFromFileFullpath);
        writeEnvModuleInit(envModuleFullpath);

        markStepSucceeded(step);
        nextStep = 'git-filter-script-create';
        break;

      case 'git-filter-script-create':
        createGitFilterScript(scriptsDir);
        markStepSucceeded(step);
        nextStep = 'write-gitattributes';
        break;

      case 'write-gitattributes':
        if (!envFromFileFullpath) throw new Error('no envFromFileFullpath');

        writeGitattributes({ envFromFileFullpath, scriptsDir });
        markStepSucceeded(step);
        nextStep = 'git-filter-enable';
        break;

      case 'git-filter-enable':
        enableGitFilter(scriptsDir);
        markStepSucceeded(step);
        nextStep = 'git-stage-all';
        break;

      case 'git-stage-all':
        gitStageAll();
        markStepSucceeded(step);
        break;

      default:
        throw new Error(`Unknown step: ${step}`);
    }

    if (nextStep && nextStep !== step) {
      setStep(nextStep);
    }
  }, [step]);

  const handleInitialConfirmation = (didConfirm: boolean) => {
    if (step !== 'initial-confirmation') {
      throw new Error(
        'handleInitialConfirmation was called during the wrong step',
      );
    }

    if (didConfirm) {
      markStepSucceeded(step);
      setStep('git-repo-check');
    } else {
      exit();
    }
  };

  return (
    <Box>
      {/* LOGS: */}
      <Static items={stepsComplete}>
        {(completedStep) => {
          const status = completedStep.status === 'succeeded' ? '✅' : '❌';

          return (
            <Box key={completedStep.step}>
              {completedStep.step === 'git-repo-check' && (
                <Text>· {status} Making sure this is a git repository</Text>
              )}

              {completedStep.step === 'git-clean-check' && (
                <Text>
                  · {status} Making sure the git working tree is clean
                </Text>
              )}

              {completedStep.step === 'env-module-check' && (
                <Text>
                  · {status} Making sure there isn&apos;t already an env.ts file
                  in {envModuleDir}
                </Text>
              )}

              {completedStep.step === 'env-module-create' && (
                <Text>
                  · {status} Initializing {envModuleFullpath}
                </Text>
              )}

              {completedStep.step === 'git-filter-script-create' && (
                <Text>
                  · {status} Adding {GIT_FILTER_SCRIPT_FILENAME}
                </Text>
              )}

              {completedStep.step === 'write-gitattributes' && (
                <Text>· {status} Writing to .gitattributes</Text>
              )}

              {completedStep.step === 'git-filter-enable' && (
                <Text>· {status} Enabling the new git filter</Text>
              )}

              {completedStep.step === 'git-stage-all' && (
                <Text>· {status} Staging all changed and added files</Text>
              )}
            </Box>
          );
        }}
      </Static>

      {/* INTERACTIVE: */}
      <Box marginTop={1}>
        {step === 'initial-confirmation' && (
          <InitialConfirmation
            confirm={handleInitialConfirmation}
            scriptsDir={scriptsDir}
            envModuleDir={envModuleDir}
          />
        )}
      </Box>

      {errorMessage && (
        <Text color="red">
          <Newline />
          {errorMessage}
          <Newline />
        </Text>
      )}
    </Box>
  );
};

export default Setup;
