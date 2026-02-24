// Safe math expression evaluator without eval or Function constructor

interface Token {
  type: 'number' | 'operator' | 'function' | 'constant' | 'paren';
  value: string | number;
}

const OPERATORS = ['+', '-', '×', '÷', '*', '/', '^', '**'];
const FUNCTIONS = ['sin', 'cos', 'tan', 'ln', 'log', 'sqrt'];
const CONSTANTS: Record<string, number> = {
  'π': Math.PI,
  'e': Math.E,
};

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < expr.length) {
    const char = expr[i];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Numbers (including decimals)
    if (/\d/.test(char) || (char === '.' && /\d/.test(expr[i + 1] || ''))) {
      let num = '';
      while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'number', value: parseFloat(num) });
      continue;
    }
    
    // Operators
    if (OPERATORS.includes(char) || (char === '*' && expr[i + 1] === '*')) {
      if (char === '*' && expr[i + 1] === '*') {
        tokens.push({ type: 'operator', value: '^' });
        i += 2;
      } else {
        tokens.push({ type: 'operator', value: char });
        i++;
      }
      continue;
    }
    
    // Parentheses
    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      i++;
      continue;
    }
    
    // Functions and constants
    let word = '';
    while (i < expr.length && /[a-z]/i.test(expr[i])) {
      word += expr[i];
      i++;
    }
    
    if (word) {
      if (FUNCTIONS.includes(word)) {
        tokens.push({ type: 'function', value: word });
      } else if (word in CONSTANTS) {
        tokens.push({ type: 'constant', value: word });
      } else {
        throw new Error(`Unknown function or constant: ${word}`);
      }
      continue;
    }
    
    throw new Error(`Invalid character: ${char}`);
  }
  
  return tokens;
}

function getPrecedence(op: string): number {
  if (op === '+' || op === '-') return 1;
  if (op === '×' || op === '÷' || op === '*' || op === '/') return 2;
  if (op === '^' || op === '**') return 3;
  return 0;
}

function applyOperator(op: string, b: number, a: number): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×':
    case '*': return a * b;
    case '÷':
    case '/':
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    case '^':
    case '**': return Math.pow(a, b);
    default: throw new Error(`Unknown operator: ${op}`);
  }
}

function applyFunction(fn: string, arg: number): number {
  switch (fn) {
    case 'sin': return Math.sin(arg);
    case 'cos': return Math.cos(arg);
    case 'tan': return Math.tan(arg);
    case 'ln': return Math.log(arg);
    case 'log': return Math.log10(arg);
    case 'sqrt': return Math.sqrt(arg);
    default: throw new Error(`Unknown function: ${fn}`);
  }
}

export function safeMathEval(expression: string): number {
  if (!expression || expression.trim() === '') {
    throw new Error('Empty expression');
  }
  
  // Normalize operators
  const normalized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .trim();
  
  const tokens = tokenize(normalized);
  
  if (tokens.length === 0) {
    throw new Error('Empty expression');
  }
  
  // Check parentheses balance
  let parenCount = 0;
  for (const token of tokens) {
    if (token.type === 'paren') {
      if (token.value === '(') parenCount++;
      else parenCount--;
      if (parenCount < 0) throw new Error('Mismatched parentheses');
    }
  }
  if (parenCount !== 0) throw new Error('Mismatched parentheses');
  
  // Shunting yard algorithm to convert to RPN
  const output: Token[] = [];
  const operators: Token[] = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    if (token.type === 'number') {
      output.push(token);
    } else if (token.type === 'constant') {
      output.push({ type: 'number', value: CONSTANTS[token.value as string] });
    } else if (token.type === 'function') {
      operators.push(token);
    } else if (token.type === 'operator') {
      while (
        operators.length > 0 &&
        operators[operators.length - 1].type === 'operator' &&
        getPrecedence(operators[operators.length - 1].value as string) >= getPrecedence(token.value as string)
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token.type === 'paren') {
      if (token.value === '(') {
        operators.push(token);
      } else {
        while (operators.length > 0 && operators[operators.length - 1].value !== '(') {
          output.push(operators.pop()!);
        }
        if (operators.length === 0) throw new Error('Mismatched parentheses');
        operators.pop(); // Remove '('
        
        // If there's a function on top, pop it to output
        if (operators.length > 0 && operators[operators.length - 1].type === 'function') {
          output.push(operators.pop()!);
        }
      }
    }
  }
  
  while (operators.length > 0) {
    const op = operators.pop()!;
    if (op.type === 'paren') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  
  // Evaluate RPN
  const stack: number[] = [];
  
  for (const token of output) {
    if (token.type === 'number') {
      stack.push(token.value as number);
    } else if (token.type === 'operator') {
      if (stack.length < 2) throw new Error('Invalid expression');
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(applyOperator(token.value as string, b, a));
    } else if (token.type === 'function') {
      if (stack.length < 1) throw new Error('Invalid expression');
      const arg = stack.pop()!;
      stack.push(applyFunction(token.value as string, arg));
    }
  }
  
  if (stack.length !== 1) throw new Error('Invalid expression');
  
  const result = stack[0];
  if (!isFinite(result)) throw new Error('Invalid calculation result');
  
  return result;
}
