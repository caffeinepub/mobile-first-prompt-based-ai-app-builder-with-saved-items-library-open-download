import React, { useState } from 'react';
import { Delete } from 'lucide-react';
import { safeMathEval } from '../../utils/safeMathEval';

interface CalculatorData {
  title?: string;
  mode?: 'basic' | 'scientific';
}

interface CalculatorRuntimeProps {
  data?: CalculatorData;
}

const basicButtons = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
];

const scientificButtons = [
  ['sin', 'cos', 'tan', 'ln', 'log'],
  ['√', 'x²', 'xʸ', 'π', 'e'],
  ['(', ')', 'C', '⌫', '÷'],
  ['7', '8', '9', '×', '−'],
  ['4', '5', '6', '+', '='],
  ['1', '2', '3', '0', '.'],
];

export default function CalculatorRuntime({ data }: CalculatorRuntimeProps) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const isScientific = data?.mode === 'scientific';
  const buttons = isScientific ? scientificButtons : basicButtons;

  const handleButton = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
      setExpression('');
      setJustEvaluated(false);
      return;
    }

    if (btn === '⌫') {
      if (expression.length <= 1) {
        setDisplay('0');
        setExpression('');
      } else {
        const newExpr = expression.slice(0, -1);
        setExpression(newExpr);
        setDisplay(newExpr || '0');
      }
      setJustEvaluated(false);
      return;
    }

    if (btn === '=') {
      try {
        const evalExpr = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, 'pi')
          .replace(/√/g, 'sqrt')
          .replace(/x²/g, '^2')
          .replace(/xʸ/g, '^');
        const result = safeMathEval(evalExpr);
        const resultStr = Number.isFinite(result) ? String(parseFloat(result.toFixed(10))) : 'Error';
        setDisplay(resultStr);
        setExpression(resultStr);
        setJustEvaluated(true);
      } catch {
        setDisplay('Error');
        setExpression('');
        setJustEvaluated(true);
      }
      return;
    }

    if (btn === '±') {
      const val = parseFloat(display);
      if (!isNaN(val)) {
        const newVal = String(-val);
        setDisplay(newVal);
        setExpression(newVal);
      }
      return;
    }

    if (btn === '%') {
      const val = parseFloat(display);
      if (!isNaN(val)) {
        const newVal = String(val / 100);
        setDisplay(newVal);
        setExpression(newVal);
      }
      return;
    }

    const isOperator = ['÷', '×', '−', '+', '^'].includes(btn);
    const isFn = ['sin', 'cos', 'tan', 'ln', 'log', '√'].includes(btn);

    let newExpr = justEvaluated && !isOperator ? btn : expression + btn;

    if (isFn) {
      newExpr = (justEvaluated ? '' : expression) + btn + '(';
    }

    setExpression(newExpr);
    setDisplay(newExpr);
    setJustEvaluated(false);
  };

  const getButtonStyle = (btn: string): string => {
    const base = 'flex items-center justify-center rounded-xl font-semibold text-sm transition-all active:scale-95 select-none cursor-pointer h-12';
    if (btn === '=') return `${base} bg-[var(--accent)] hover:bg-[var(--primary)] text-white shadow-sm col-span-1`;
    if (['÷', '×', '−', '+'].includes(btn)) return `${base} bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] font-bold`;
    if (['C', '±', '%'].includes(btn)) return `${base} bg-muted hover:bg-muted/80 text-muted-foreground font-medium`;
    if (['sin', 'cos', 'tan', 'ln', 'log', '√', 'x²', 'xʸ', 'π', 'e', '(', ')'].includes(btn)) return `${base} bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs`;
    if (btn === '⌫') return `${base} bg-muted hover:bg-red-50 hover:text-red-500 text-muted-foreground`;
    return `${base} bg-white hover:bg-muted border border-border text-foreground shadow-sm`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[400px] bg-muted/30">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
        {/* Display */}
        <div className="bg-[var(--primary)] px-5 py-5 text-right">
          <div className="text-white/60 text-xs font-mono min-h-[18px] truncate mb-1">
            {expression && expression !== display ? expression : ''}
          </div>
          <div className="text-white text-3xl font-bold font-mono truncate leading-tight">
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="p-3 space-y-2">
          {buttons.map((row, ri) => (
            <div key={ri} className={`grid gap-2 ${isScientific ? 'grid-cols-5' : 'grid-cols-4'}`}>
              {row.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleButton(btn)}
                  className={getButtonStyle(btn)}
                >
                  {btn === '⌫' ? <Delete className="w-4 h-4" /> : btn}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
