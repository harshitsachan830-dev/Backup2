import {
  parseErrorLine,
  parseErrorExplanation,
  createErrorBannerElement
} from '../cell-error-highlighter';

describe('Cell Error Highlighter', () => {
  describe('parseErrorLine', () => {
    it('extracts line 99 from SyntaxError traceback (user screenshot 1)', () => {
      const tb = [
        '  Cell In[3], line 99',
        '    print("MAE:", round(mae, 4)',
        '                                ^',
        "SyntaxError: '(' was never closed"
      ].join('\n');
      const code = new Array(100).fill('print(1)').join('\n');
      const line = parseErrorLine(tb, code);
      expect(line).toBe(99);
    });

    it('extracts line 6 from ZeroDivisionError traceback (user screenshot 2)', () => {
      const tb = [
        '---------------------------------------------------------------------------',
        'ZeroDivisionError                         Traceback (most recent call last)',
        'Cell In[1], line 6',
        '      4 result = np.mean(numbers)',
        '      5 print(result)',
        '----> 6 answer = result / 0',
        '      7 print(answer)',
        '',
        'ZeroDivisionError: division by zero'
      ].join('\n');
      const code = [
        'import numpy as np',
        '',
        'numbers = [10, 20, 30]',
        'result = np.mean(numbers)',
        'print(result)',
        'answer = result / 0',
        'print(answer)'
      ].join('\n');
      const line = parseErrorLine(tb, code);
      expect(line).toBe(6);
    });

    it('handles ipython-input style traceback frames', () => {
      const tb = 'File "<ipython-input-42-a1b2c3d4>", line 12, in <module>\n    foo()';
      const code = new Array(20).fill('x = 1').join('\n');
      const line = parseErrorLine(tb, code);
      expect(line).toBe(12);
    });

    it('handles arrow pointers in tracebacks', () => {
      const tb = '----> 23 y = data["non_existent"]';
      const code = new Array(30).fill('x = 1').join('\n');
      const line = parseErrorLine(tb, code);
      expect(line).toBe(23);
    });
  });

  describe('parseErrorExplanation', () => {
    it('generates friendly explanations for ZeroDivisionError matching sample', () => {
      const info = parseErrorExplanation('ZeroDivisionError', 'division by zero', 6);
      expect(info.explanation).toContain('Cannot divide a number by zero');
      expect(info.tip).toContain('Check the denominator before performing division');
    });

    it('generates friendly explanations for SyntaxError with unclosed parenthesis', () => {
      const info = parseErrorExplanation('SyntaxError', "'(' was never closed", 99);
      expect(info.explanation).toContain("'(' was never closed");
      expect(info.tip).toContain("closing parenthesis ')'");
    });

    it('generates friendly explanations for NameError with variable name', () => {
      const info = parseErrorExplanation('NameError', "name 'pd' is not defined", 2);
      expect(info.explanation).toContain("'pd' is not defined");
      expect(info.tip).toContain("execute the cell where 'pd' is defined or imported");
    });

    it('generates friendly explanations for KeyError with column name', () => {
      const info = parseErrorExplanation('KeyError', "'Price_Lakhs'", 14);
      expect(info.explanation).toContain("'Price_Lakhs'");
      expect(info.tip).toContain('df.columns');
    });

    it('generates friendly explanations for TypeError', () => {
      const info = parseErrorExplanation('TypeError', "unsupported operand type(s) for +: 'int' and 'str'", 5);
      expect(info.explanation).toContain('Unsupported operand type');
      expect(info.tip).toContain('int(), float(), or str()');
    });
  });

  describe('createErrorBannerElement', () => {
    it('creates DOM structure matching user sample card', () => {
      let dismissed = false;
      const el = createErrorBannerElement({
        errorType: 'ZeroDivisionError',
        errorLine: 6,
        explanation: 'Cannot divide a number by zero.',
        tip: 'Check the denominator before performing division.',
        onDismiss: () => {
          dismissed = true;
        }
      });

      expect(el.className).toBe('mm-cell-error-card');
      expect(el.querySelector('.mm-card-title')?.textContent).toBe('ZeroDivisionError — Line 6');
      expect(el.querySelector('.mm-card-desc')?.textContent).toBe('Cannot divide a number by zero.');
      expect(el.querySelector('.mm-card-tip')?.textContent).toBe('Check the denominator before performing division.');

      // Test dismiss click
      const dismissBtn = el.querySelector('.mm-card-dismiss') as HTMLButtonElement;
      expect(dismissBtn).not.toBeNull();
      dismissBtn.click();
      expect(dismissed).toBe(true);
    });
  });
});

