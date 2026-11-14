import { useMemo, useState } from 'react';
import { LEVELS, generateSheet, levelIndexById } from '../curriculum';
import { PLACEMENT_CHECKPOINTS, PLACEMENT_PROBLEMS, placementStartIndex, placementTimeLimit } from '../mastery';
import { SheetRunner } from './SheetRunner';

type Props = {
  onPlaced: (levelIndex: number) => void;
  onQuit: () => void;
};

export function Placement({ onPlaced, onQuit }: Props) {
  const [step, setStep] = useState(0);
  const level = LEVELS[levelIndexById(PLACEMENT_CHECKPOINTS[step])];
  const problems = useMemo(() => generateSheet(level, PLACEMENT_PROBLEMS, Math.random), [level]);
  const limit = placementTimeLimit(level);

  return (
    <SheetRunner
      key={step}
      level={level}
      problems={problems}
      targetSeconds={limit}
      correction={false}
      heading={`Nivelamento · etapa ${step + 1} de ${PLACEMENT_CHECKPOINTS.length}`}
      onQuit={onQuit}
      onDone={(correct, seconds) => {
        const passed = correct === PLACEMENT_PROBLEMS && seconds <= limit;
        if (passed && step < PLACEMENT_CHECKPOINTS.length - 1) {
          setStep(step + 1);
          return;
        }
        onPlaced(placementStartIndex(passed ? step + 1 : step));
      }}
    />
  );
}
