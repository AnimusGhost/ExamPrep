import { useMemo, useState } from 'react';
import Panel from '../../components/Panel';
import Button from '../../components/Button';

type DeductionMode = 'preTax' | 'postTax';

type CalculatorState = {
  hourlyRate: number;
  hoursWorked: number;
  overtimeAfter: number;
  overtimeMultiplier: number;
  deductionPercent: number;
  deductionMode: DeductionMode;
  flatDeduction: number;
};

const defaultState: CalculatorState = {
  hourlyRate: 22,
  hoursWorked: 40,
  overtimeAfter: 40,
  overtimeMultiplier: 1.5,
  deductionPercent: 5,
  deductionMode: 'preTax',
  flatDeduction: 0
};

const CalculatorPage = () => {
  const [state, setState] = useState<CalculatorState>(defaultState);

  const summary = useMemo(() => {
    const regularHours = Math.min(state.hoursWorked, state.overtimeAfter);
    const overtimeHours = Math.max(state.hoursWorked - state.overtimeAfter, 0);
    const regularPay = regularHours * state.hourlyRate;
    const overtimePay = overtimeHours * state.hourlyRate * state.overtimeMultiplier;
    const grossPay = regularPay + overtimePay;
    const percentDeduction = grossPay * (state.deductionPercent / 100);
    const preTaxDeductions = state.deductionMode === 'preTax' ? percentDeduction : 0;
    const postTaxDeductions = state.deductionMode === 'postTax' ? percentDeduction : 0;
    const totalDeductions = preTaxDeductions + postTaxDeductions + state.flatDeduction;
    const netPay = Math.max(grossPay - totalDeductions, 0);

    return {
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      grossPay,
      percentDeduction,
      totalDeductions,
      netPay
    };
  }, [state]);

  const update = <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const reset = () => setState(defaultState);

  return (
    <div className="flex flex-col gap-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Payroll Calculator</p>
            <h2 className="text-2xl font-semibold text-ink-900">Estimate gross &amp; net pay</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Simple weekly overtime model with configurable deductions. Adjust assumptions as needed.
            </p>
          </div>
          <Button variant="secondary" onClick={reset}>
            Reset inputs
          </Button>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <h3 className="card-title">Inputs</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Hourly rate ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={0.25}
                value={state.hourlyRate}
                onChange={(event) => update('hourlyRate', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="label">Hours worked</label>
              <input
                className="input"
                type="number"
                min={0}
                step={0.25}
                value={state.hoursWorked}
                onChange={(event) => update('hoursWorked', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="label">Overtime after (hours)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={0.5}
                value={state.overtimeAfter}
                onChange={(event) => update('overtimeAfter', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="label">Overtime multiplier</label>
              <input
                className="input"
                type="number"
                min={1}
                step={0.1}
                value={state.overtimeMultiplier}
                onChange={(event) => update('overtimeMultiplier', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="label">Percent deduction (%)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={0.1}
                value={state.deductionPercent}
                onChange={(event) => update('deductionPercent', Number(event.target.value))}
              />
            </div>
            <div>
              <label className="label">Deduction timing</label>
              <select
                className="input"
                value={state.deductionMode}
                onChange={(event) => update('deductionMode', event.target.value as DeductionMode)}
              >
                <option value="preTax">Pre-tax</option>
                <option value="postTax">Post-tax</option>
              </select>
            </div>
            <div>
              <label className="label">Flat deduction ($)</label>
              <input
                className="input"
                type="number"
                min={0}
                step={1}
                value={state.flatDeduction}
                onChange={(event) => update('flatDeduction', Number(event.target.value))}
              />
            </div>
          </div>
        </Panel>

        <Panel>
          <h3 className="card-title">Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between">
              <span>Regular hours</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{summary.regularHours.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Overtime hours</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{summary.overtimeHours.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Regular pay</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">${summary.regularPay.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Overtime pay</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">${summary.overtimePay.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span>Gross pay</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">${summary.grossPay.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Percent deduction</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">${summary.percentDeduction.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total deductions</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">${summary.totalDeductions.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
              <span className="font-semibold">Net pay estimate</span>
              <span className="text-base font-semibold">${summary.netPay.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Assumes a weekly overtime threshold of {state.overtimeAfter} hours at {state.overtimeMultiplier}×.
          </p>
        </Panel>
      </div>
    </div>
  );
};

export default CalculatorPage;
