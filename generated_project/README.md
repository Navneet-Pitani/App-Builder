# Simple Calculator App

A lightweight, browser‑based calculator that supports basic arithmetic operations, clear and backspace functionality, keyboard shortcuts, and robust error handling. The app is built with plain HTML, CSS, and JavaScript—no build tools or external libraries required.

---

## Tech Stack
- **HTML** – Structure of the calculator UI.
- **CSS** – Styling and responsive layout.
- **JavaScript** – Core calculator logic (`Calculator` class), UI interaction, and keyboard support.

---

## Features
- **Basic operations**: addition, subtraction, multiplication, division.
- **Decimal support** with automatic leading zero handling.
- **Clear (C)** button to reset the calculator.
- **Backspace (←)** to delete the last character.
- **Keyboard shortcuts**:
  - Digits `0‑9`
  - Operators `+ - * /`
  - `.` for decimal point
  - `Enter` or `=` to evaluate
  - `Backspace` to delete
  - `Escape` to clear
- **Error handling**:
  - Detects invalid expressions and displays a temporary error message.
  - Handles division‑by‑zero gracefully.
- **Result formatting** – Rounds floating‑point results to a sensible precision and trims trailing zeros.
- **Responsive UI** – Works on desktop and mobile browsers.

---

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/simple-calculator.git
   cd simple-calculator
   ```
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari, etc.).
3. No additional build steps, package managers, or server configuration are required.

---

## Usage
### Button clicks
- Click the numeric buttons (`0‑9`) to build a number.
- Use the operator buttons (`+ − × ÷`) to add an operation.
- Press **C** to clear the current input.
- Press **←** to delete the last character.
- Press **=** (or the **Enter** key) to evaluate the expression. The result will be displayed and can be used for further calculations.

### Keyboard shortcuts
| Key | Action |
|-----|--------|
| `0‑9` | Append digit |
| `.` | Append decimal point |
| `+ - * /` | Append operator |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Escape` | Clear |

### Error messages
- **Invalid expression** – Shown when the input contains characters other than numbers, operators, or a decimal point.
- **Division by zero** – Shown when an evaluation would result in an infinite value.

Errors appear in the display for 1.5 seconds before the calculator returns to the previous state.

---

## File Structure
```
simple-calculator/
├─ index.html      # Markup for the calculator UI
├─ styles.css      # Styling (layout, colors, error state)
├─ script.js       # Calculator class, UI logic, and event handling
└─ README.md       # Documentation (you are reading it!)
```
- **index.html** – Contains the calculator layout, button definitions, and a read‑only input field that serves as the display.
- **styles.css** – Provides visual styling, including grid layout for buttons and an `.error` class used for temporary error feedback.
- **script.js** – Implements the `Calculator` class (core arithmetic, validation, and formatting) and wires UI interactions (button clicks and keyboard events). It also exports the class for testing when run in a Node environment.

---

## Testing (optional)
The `Calculator` class is exported via CommonJS when the script is executed in a Node environment, enabling unit testing. Example using Jest:
```js
const { Calculator } = require('../script.js');

test('adds two numbers', () => {
  const calc = new Calculator();
  calc.append('2');
  calc.append('+');
  calc.append('3');
  expect(calc.evaluate()).toBe(5);
});
```
You can import the class directly in your test suite to verify behavior for edge cases such as multiple operators, decimal handling, and error conditions.

---

## License
[Insert License Here]
