import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useState } from 'react';
import { safeMathEval } from '../../utils/safeMathEval';

interface CalculatorRuntimeProps {
  data: any;
}

export default function CalculatorRuntime({ data }: CalculatorRuntimeProps) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  
  const isScientific = data.mode === 'scientific';

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setError(null);
  };

  const handleClearEntry = () => {
    setDisplay('0');
    setError(null);
  };

  const handleNumber = (num: string) => {
    if (error) {
      setError(null);
      setDisplay(num);
      setExpression(num);
      return;
    }
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setExpression(num);
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op: string) => {
    if (error) return;
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op);
    } else {
      setExpression(expression + op);
    }
    setDisplay(op);
  };

  const handleDecimal = () => {
    if (error) {
      setError(null);
      setDisplay('0.');
      setExpression('0.');
      return;
    }
    const parts = expression.split(/[+\-×÷]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes('.')) {
      const newExpr = expression + '.';
      setExpression(newExpr);
      setDisplay(display + '.');
    }
  };

  const handleParenthesis = (paren: string) => {
    if (error) {
      setError(null);
      setExpression(paren);
      setDisplay(paren);
      return;
    }
    setExpression(expression + paren);
    setDisplay(paren);
  };

  const handleConstant = (constant: string) => {
    if (error) setError(null);
    const value = constant === 'π' ? Math.PI.toString() : Math.E.toString();
    if (display === '0' || error) {
      setDisplay(constant);
      setExpression(value);
    } else {
      setDisplay(display + constant);
      setExpression(expression + value);
    }
  };

  const handleFunction = (func: string) => {
    if (error) setError(null);
    setExpression(expression + func + '(');
    setDisplay(func + '(');
  };

  const handlePower = () => {
    if (error) return;
    setExpression(expression + '^');
    setDisplay('^');
  };

  const handleEquals = () => {
    if (error || !expression) return;
    
    try {
      const result = safeMathEval(expression);
      const resultStr = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
      setDisplay(resultStr);
      setExpression(resultStr);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error');
      setDisplay('Error');
    }
  };

  const handleNegate = () => {
    if (error) return;
    try {
      const result = safeMathEval(expression);
      const negated = -result;
      const negatedStr = Number.isInteger(negated) ? negated.toString() : negated.toFixed(8).replace(/\.?0+$/, '');
      setDisplay(negatedStr);
      setExpression(negatedStr);
    } catch {
      if (expression.startsWith('-')) {
        setExpression(expression.slice(1));
        setDisplay(display.slice(1));
      } else {
        setExpression('-' + expression);
        setDisplay('-' + display);
      }
    }
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '−':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : currentValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleEqualsBasic = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '−':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : currentValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const buttonClass = 'h-14 text-base font-semibold transition-all active:scale-95 touch-manipulation';
  const numberButtonClass = `${buttonClass} bg-card hover:bg-accent`;
  const operatorButtonClass = `${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`;
  const functionButtonClass = `${buttonClass} bg-muted hover:bg-muted/80 text-sm`;

  if (isScientific) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">{data.title || 'Scientific Calculator'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1 min-h-[1.5rem] break-all">
              {expression || '0'}
            </div>
            <div className={`text-3xl font-bold break-all min-h-[2.5rem] flex items-center justify-end ${error ? 'text-destructive' : ''}`}>
              {display}
            </div>
            {error && (
              <div className="text-xs text-destructive mt-1">
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <Button onClick={() => handleFunction('sin')} variant="secondary" className={functionButtonClass}>
              sin
            </Button>
            <Button onClick={() => handleFunction('cos')} variant="secondary" className={functionButtonClass}>
              cos
            </Button>
            <Button onClick={() => handleFunction('tan')} variant="secondary" className={functionButtonClass}>
              tan
            </Button>
            <Button onClick={() => handleFunction('ln')} variant="secondary" className={functionButtonClass}>
              ln
            </Button>
            <Button onClick={() => handleFunction('log')} variant="secondary" className={functionButtonClass}>
              log
            </Button>

            <Button onClick={() => handleFunction('sqrt')} variant="secondary" className={functionButtonClass}>
              √
            </Button>
            <Button onClick={handlePower} variant="secondary" className={functionButtonClass}>
              x<sup>y</sup>
            </Button>
            <Button onClick={() => handleConstant('π')} variant="secondary" className={functionButtonClass}>
              π
            </Button>
            <Button onClick={() => handleConstant('e')} variant="secondary" className={functionButtonClass}>
              e
            </Button>
            <Button onClick={() => handleParenthesis('(')} variant="secondary" className={functionButtonClass}>
              (
            </Button>

            <Button onClick={handleClear} variant="secondary" className={functionButtonClass}>
              AC
            </Button>
            <Button onClick={handleClearEntry} variant="secondary" className={functionButtonClass}>
              C
            </Button>
            <Button onClick={() => handleParenthesis(')')} variant="secondary" className={functionButtonClass}>
              )
            </Button>
            <Button onClick={handleNegate} variant="secondary" className={functionButtonClass}>
              ±
            </Button>
            <Button onClick={() => handleOperator('÷')} className={operatorButtonClass}>
              ÷
            </Button>

            <Button onClick={() => handleNumber('7')} variant="outline" className={numberButtonClass}>
              7
            </Button>
            <Button onClick={() => handleNumber('8')} variant="outline" className={numberButtonClass}>
              8
            </Button>
            <Button onClick={() => handleNumber('9')} variant="outline" className={numberButtonClass}>
              9
            </Button>
            <Button onClick={() => handleOperator('×')} className={operatorButtonClass}>
              ×
            </Button>
            <Button onClick={() => handleOperator('-')} className={operatorButtonClass}>
              −
            </Button>

            <Button onClick={() => handleNumber('4')} variant="outline" className={numberButtonClass}>
              4
            </Button>
            <Button onClick={() => handleNumber('5')} variant="outline" className={numberButtonClass}>
              5
            </Button>
            <Button onClick={() => handleNumber('6')} variant="outline" className={numberButtonClass}>
              6
            </Button>
            <Button onClick={() => handleOperator('+')} className={operatorButtonClass}>
              +
            </Button>
            <Button onClick={handleEquals} className={`${operatorButtonClass} row-span-2`}>
              =
            </Button>

            <Button onClick={() => handleNumber('1')} variant="outline" className={numberButtonClass}>
              1
            </Button>
            <Button onClick={() => handleNumber('2')} variant="outline" className={numberButtonClass}>
              2
            </Button>
            <Button onClick={() => handleNumber('3')} variant="outline" className={numberButtonClass}>
              3
            </Button>
            <Button onClick={handleDecimal} variant="outline" className={numberButtonClass}>
              .
            </Button>

            <Button onClick={() => handleNumber('0')} variant="outline" className={`${numberButtonClass} col-span-4`}>
              0
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{data.title || 'Calculator'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted rounded-lg p-4 text-right">
          <div className="text-4xl font-bold break-all min-h-[3rem] flex items-center justify-end">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button onClick={clear} variant="secondary" className={functionButtonClass}>
            AC
          </Button>
          <Button onClick={clearEntry} variant="secondary" className={functionButtonClass}>
            C
          </Button>
          <Button
            onClick={() => {
              const value = parseFloat(display);
              setDisplay(String(value * -1));
            }}
            variant="secondary"
            className={functionButtonClass}
          >
            ±
          </Button>
          <Button onClick={() => performOperation('÷')} className={operatorButtonClass}>
            ÷
          </Button>

          <Button onClick={() => inputDigit('7')} variant="outline" className={numberButtonClass}>
            7
          </Button>
          <Button onClick={() => inputDigit('8')} variant="outline" className={numberButtonClass}>
            8
          </Button>
          <Button onClick={() => inputDigit('9')} variant="outline" className={numberButtonClass}>
            9
          </Button>
          <Button onClick={() => performOperation('×')} className={operatorButtonClass}>
            ×
          </Button>

          <Button onClick={() => inputDigit('4')} variant="outline" className={numberButtonClass}>
            4
          </Button>
          <Button onClick={() => inputDigit('5')} variant="outline" className={numberButtonClass}>
            5
          </Button>
          <Button onClick={() => inputDigit('6')} variant="outline" className={numberButtonClass}>
            6
          </Button>
          <Button onClick={() => performOperation('−')} className={operatorButtonClass}>
            −
          </Button>

          <Button onClick={() => inputDigit('1')} variant="outline" className={numberButtonClass}>
            1
          </Button>
          <Button onClick={() => inputDigit('2')} variant="outline" className={numberButtonClass}>
            2
          </Button>
          <Button onClick={() => inputDigit('3')} variant="outline" className={numberButtonClass}>
            3
          </Button>
          <Button onClick={() => performOperation('+')} className={operatorButtonClass}>
            +
          </Button>

          <Button
            onClick={() => inputDigit('0')}
            variant="outline"
            className={`${numberButtonClass} col-span-2`}
          >
            0
          </Button>
          <Button onClick={inputDecimal} variant="outline" className={numberButtonClass}>
            .
          </Button>
          <Button onClick={handleEqualsBasic} className={operatorButtonClass}>
            =
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
