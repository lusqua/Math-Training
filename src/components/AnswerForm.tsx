import { useEffect, useRef, useState } from 'react';
import { parseAnswer } from '../curriculum';

type Props = {
  /** Changes whenever a new problem is shown, to clear and refocus the field. */
  problemKey: string;
  label?: string;
  allowNegative?: boolean;
  onSubmit: (value: number) => void;
};

export function AnswerForm({ problemKey, label, allowNegative, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    setInvalid(false);
    input.current?.focus();
  }, [problemKey]);

  return (
    <form
      className="answer"
      onSubmit={(e) => {
        e.preventDefault();
        const n = parseAnswer(value);
        if (n === null) {
          setInvalid(true);
          input.current?.focus();
          return;
        }
        onSubmit(n);
        setValue('');
        input.current?.focus();
      }}
    >
      {label && <span className="answer-label">{label}</span>}
      <input
        ref={input}
        aria-label="Resposta"
        className={invalid ? 'invalid' : undefined}
        // iOS numeric keypads have no minus key, so negative levels get the full keyboard.
        inputMode={allowNegative ? 'text' : 'numeric'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setInvalid(false);
        }}
      />
      <button type="submit" className="primary">
        Ok
      </button>
    </form>
  );
}
