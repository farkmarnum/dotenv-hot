import React, { useEffect, useState } from 'react';
import { Box, Text, Static, Newline, useApp } from 'ink';
import TextInput from 'ink-text-input';

import InitialConfirmation from '../InitialConfirmation';
import { guardGit, guardEnvModule } from '../../helpers/guards';
import { isTypescript } from '../../helpers/util';
import { writeEnvModuleInit } from '../../helpers/envModule';
import {
  createGitFilterScript,
  writeGitattributes,
  enableGitFilter,
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
  'git-check',
  'env-module-prompt',
  'env-module-check',
  'env-module-create',
  'git-filter-script-create',
  'write-gitattributes',
  'git-filter-enable',
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

    if (step === 'git-check') {
      const msg = guardGit();
      if (msg) {
        setErrorMessage(msg);
        markStepFailed(step);
      } else {
        markStepSucceeded(step);
        nextStep = 'env-module-prompt';
      }
    }

    if (step === 'env-module-check') {
      if (!envModuleFullpath) throw new Error('no envModuleFullpath');

      const msg = guardEnvModule(envModuleFullpath);
      if (msg) {
        setErrorMessage(msg);
        markStepFailed(step);
      } else {
        markStepSucceeded(step);
        nextStep = 'env-module-create';
      }
    }

    if (step === 'env-module-create') {
      if (!envModuleFullpath) throw new Error('no envModuleFullpath');

      writeEnvModuleInit(envModuleFullpath);
      markStepSucceeded(step);
      nextStep = 'git-filter-script-create';
    }

    if (step === 'git-filter-script-create') {
      createGitFilterScript();
      markStepSucceeded(step);
      nextStep = 'write-gitattributes';
    }

    if (step === 'write-gitattributes') {
      if (!envModuleFullpath) throw new Error('no envModuleFullpath');

      writeGitattributes(envModuleFullpath);
      markStepSucceeded(step);
      nextStep = 'git-filter-enable';
    }

    if (step === 'git-filter-enable') {
      enableGitFilter();
      markStepSucceeded(step);
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
      setStep('git-check');
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
              {completedStep.step === 'git-check' && (
                <Text>· {status} Making sure this is a git repository</Text>
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
