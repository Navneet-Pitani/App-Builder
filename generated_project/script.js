// Calculator script
// Constants & Helper Functions
const DISPLAY_ID = 'display';
function getDisplay() {
  return document.getElementById(DISPLAY_ID);
}
function isOperator(char) {
  return /[+\-*/]/.test(char);
}

// Calculator Class
class Calculator {
  constructor() {
    this.currentInput = '';
    this.lastResult = null;
  }

  /**
   * Append a character (digit, decimal point, or operator) to the current input.
   * Performs validation to avoid invalid sequences.
   */
  append(char) {
    if (char >= '0' && char <= '9') {
      // digit
      this.currentInput += char;
    } else if (char === '.') {
      // decimal point – ensure the current number doesn't already contain one
      const lastOperatorIdx = Math.max(
        this.currentInput.lastIndexOf('+'),
        this.currentInput.lastIndexOf('-'),
        this.currentInput.lastIndexOf('*'),
        this.currentInput.lastIndexOf('/')
      );
      const numberPart = this.currentInput.slice(lastOperatorIdx + 1);
      if (!numberPart.includes('.')) {
        // allow leading '.' as '0.'
        if (numberPart.length === 0) {
          this.currentInput += '0.';
        } else {
          this.currentInput += '.';
        }
      }
    } else if (isOperator(char)) {
      // operator – prevent multiple consecutive operators
      if (this.currentInput.length === 0) {
        // allow leading minus for negative numbers
        if (char === '-') {
          this.currentInput = '-';
        }
        return;
      }
      const lastChar = this.currentInput[this.currentInput.length - 1];
      if (isOperator(lastChar)) {
        // replace the previous operator with the new one
        this.currentInput = this.currentInput.slice(0, -1) + char;
      } else {
        this.currentInput += char;
      }
    }
  }

  clear() {
    this.currentInput = '';
    this.lastResult = null;
  }

  backspace() {
    if (this.currentInput.length > 0) {
      this.currentInput = this.currentInput.slice(0, -1);
    }
  }

  /**
   * Evaluate the current expression safely.
   * Throws an Error with a descriptive message on failure.
   */
  evaluate() {
    if (this.currentInput.length === 0) {
      return 0;
    }
    // Sanitize – allow only numbers, operators and decimal point
    if (!/^[0-9+\-*/.]+$/.test(this.currentInput)) {
      throw new Error('Invalid expression');
    }
    // Prevent expression ending with an operator
    const lastChar = this.currentInput[this.currentInput.length - 1];
    if (isOperator(lastChar)) {
      // Remove trailing operator before evaluation
      this.currentInput = this.currentInput.slice(0, -1);
    }
    let result;
    try {
      // Use Function constructor for evaluation – it's safer than eval because we control the string
      result = Function('return ' + this.currentInput)();
    } catch (e) {
      throw new Error('Invalid expression');
    }
    if (!Number.isFinite(result)) {
      // Covers division by zero and other infinite results
      throw new Error('Division by zero');
    }
    this.lastResult = result;
    // Store result as the new input so further calculations can continue
    this.currentInput = String(result);
    return result;
  }

  /**
   * Format a numeric result to a readable string, rounding to a sensible precision.
   */
  formatResult(value) {
    // Round to 10 decimal places to avoid floating‑point noise
    const rounded = Number.isInteger(value) ? value : Number(value.toFixed(10));
    // Remove trailing zeros after decimal point
    return String(rounded).replace(/\.0+$|(?:(\.\d*?)0+$)/, '$1');
  }
}

// UI Update Functions
function updateDisplay(value) {
  const display = getDisplay();
  if (display) {
    display.value = value;
  }
}

function showError(message) {
  const display = getDisplay();
  if (!display) return;
  display.classList.add('error');
  updateDisplay(message);
  setTimeout(() => {
    display.classList.remove('error');
    updateDisplay(calculator.currentInput || '0');
  }, 1500);
}

// Event Handlers
function handleButtonClick(e) {
  const key = e.target.dataset?.key;
  if (!key) return;

  if (key === 'C') {
    calculator.clear();
    updateDisplay('0');
    return;
  }
  if (key === '←') {
    calculator.backspace();
    updateDisplay(calculator.currentInput || '0');
    return;
  }
  if (key === '=') {
    try {
      const result = calculator.evaluate();
      updateDisplay(calculator.formatResult(result));
    } catch (err) {
      showError(err.message);
    }
    return;
  }
  // All other keys are appended (digits, operators, decimal)
  calculator.append(key);
  updateDisplay(calculator.currentInput || '0');
}

function handleKeyPress(e) {
  const key = e.key;
  if (/^[0-9]$/.test(key)) {
    calculator.append(key);
    updateDisplay(calculator.currentInput || '0');
    e.preventDefault();
    return;
  }
  if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/') {
    calculator.append(key);
    updateDisplay(calculator.currentInput || '0');
    e.preventDefault();
    return;
  }
  if (key === 'Enter' || key === '=') {
    try {
      const result = calculator.evaluate();
      updateDisplay(calculator.formatResult(result));
    } catch (err) {
      showError(err.message);
    }
    e.preventDefault();
    return;
  }
  if (key === 'Backspace') {
    calculator.backspace();
    updateDisplay(calculator.currentInput || '0');
    e.preventDefault();
    return;
  }
  if (key === 'Escape') {
    calculator.clear();
    updateDisplay('0');
    e.preventDefault();
    return;
  }
}

// Initialization
const calculator = new Calculator();

// Attach event listeners after DOM is ready (script is deferred, so DOM is already parsed)
const buttonsContainer = document.querySelector('.buttons');
if (buttonsContainer) {
  buttonsContainer.addEventListener('click', handleButtonClick);
}

document.addEventListener('keydown', handleKeyPress);

// Initialise display
updateDisplay('0');

// Optional export for testing environments (CommonJS)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { Calculator, isOperator };
}
