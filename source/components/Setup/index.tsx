import React, { useEffect, useState } from 'react';
import { Box, Text, Static, Newline, useApp } from 'ink';
import TextInput from 'ink-text-input';

import InitialConfirmation from '../InitialConfirmation';
import { isTypescript } from '../../helpers/util';
import {
  checkForExistingEnvModule,
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
import { GIT_FILTER_SCRIPT_FULLPATH } from '../../helpers/constants';

const envModuleFilename = `env.${isTypescript() ? 'ts' : 'js'}`;

const Input = ({ setValue }: { setValue: (s: string) => void }) => {
  const [query, setQuery] = useState('');

  return (
    <Box>
      <Text>
        This tool will create an {envModuleFilename}
        <Text color="cyanBright" /> file in your repository that will not be
        tracked by Git.
        <Newline />
        Please specify the path where you would like this file to be located.
        <Newline />
        <Newline />
        Path:{' '}
        <TextInput value={query} onChange={setQuery} onSubmit={setValue} />
      </Text>
    </Box>
  );
};

const steps = [
  'initial-confirmation',
  'git-repo-check',
  'git-clean-check',
  'env-module-prompt',
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

const Setup = () => {
  const { exit } = useApp();

  const [step, setStep] = useState<Step>('initial-confirmation');
  const [stepsComplete, setStepsCompleted] = useState<StepStatus[]>([]);

  const markStepSucceeded = (s: Step) =>
    setStepsCompleted((curr) => [...curr, { step: s, status: 'succeeded' }]);

  const markStepFailed = (s: Step) =>
    setStepsCompleted((curr) => [...curr, { step: s, status: 'failed' }]);

  const [envModuleDir, setEnvModuleDir] = useState<string | undefined>();
  const [input, setInput] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const envModuleFullpath = envModuleDir
    ? `${envModuleDir}/${envModuleFilename}`
    : undefined;

  // HANDLE STEP CHANGE:
  useEffect(() => {
    setInput('');

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
          nextStep = 'env-module-prompt';
        }
        break;

      case 'env-module-prompt':
        break;

      case 'env-module-check':
        if (!envModuleFullpath) throw new Error('no envModuleFullpath');

        newErrorMessage = checkForExistingEnvModule(envModuleFullpath);
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

        writeEnvModuleInit(envModuleFullpath);
        markStepSucceeded(step);
        nextStep = 'git-filter-script-create';
        break;

      case 'git-filter-script-create':
        createGitFilterScript();
        markStepSucceeded(step);
        nextStep = 'write-gitattributes';
        break;

      case 'write-gitattributes':
        if (!envModuleFullpath) throw new Error('no envModuleFullpath');

        writeGitattributes(envModuleFullpath);
        markStepSucceeded(step);
        nextStep = 'git-filter-enable';
        break;

      case 'git-filter-enable':
        enableGitFilter();
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

  // HANDLE INPUT:
  useEffect(() => {
    if (input.length > 0) {
      if (step === 'env-module-prompt') {
        markStepSucceeded(step);
        setEnvModuleDir(input);
        setStep('env-module-check');
      }
    }
  }, [input, step]);

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
                  · {status} Adding {GIT_FILTER_SCRIPT_FULLPATH}
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
        {step === 'env-module-prompt' && <Input setValue={setInput} />}
        {step === 'initial-confirmation' && (
          <InitialConfirmation confirm={handleInitialConfirmation} />
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
