import { Question, Domain, Difficulty } from '../types/questions';
import { seededShuffle } from '../lib/random';

const domains: Domain[] = [
  'Payroll Procedures and Calculations',
  'Tax Laws and Regulations',
  'Compliance and Recordkeeping',
  'Payroll Software and Systems',
  'Ethical Considerations and Customer Service'
];

type CalculationTemplate = {
  title: string;
  domain: Domain;
  generate: (id: number) => Question;
};

const calculationTemplates: CalculationTemplate[] = [
  {
    title: 'Overtime premium',
    domain: 'Payroll Procedures and Calculations' as Domain,
    generate: (id: number) => {
      const rate = 18 + (id % 7);
      const hours = 40 + (id % 6) + 2;
      const overtimeHours = hours - 40;
      const total = 40 * rate + overtimeHours * rate * 1.5;
      return {
        id: `calc-ot-${id}`,
        type: 'numeric' as const,
        domain: 'Payroll Procedures and Calculations' as Domain,
        difficulty: id % 3 === 0 ? 'Easy' : id % 3 === 1 ? 'Medium' : 'Hard',
        prompt: `An employee earns $${rate}/hour and worked ${hours} hours in a week. What is the gross pay using time-and-a-half overtime?`,
        correctValue: Number(total.toFixed(2)),
        tolerance: 0.5,
        unitHint: 'USD',
        explanation: `Calculate regular pay (40 × $${rate}) plus overtime (${overtimeHours} × $${rate} × 1.5).`
      };
    }
  },
  {
    title: 'Net pay after deductions',
    domain: 'Payroll Procedures and Calculations' as Domain,
    generate: (id: number) => {
      const gross = 1200 + id * 37;
      const pretax = 60 + (id % 5) * 10;
      const taxes = 0.18;
      const postTaxDeduction = 45 + (id % 4) * 5;
      const taxable = gross - pretax;
      const taxAmount = taxable * taxes;
      const net = taxable - taxAmount - postTaxDeduction;
      return {
        id: `calc-net-${id}`,
        type: 'numeric' as const,
        domain: 'Payroll Procedures and Calculations' as Domain,
        difficulty: id % 4 === 0 ? 'Easy' : id % 4 === 1 ? 'Medium' : 'Hard',
        prompt: `An employee earns $${gross} gross. Pre-tax deductions total $${pretax}. Taxes are 18% of taxable wages. There is also a $${postTaxDeduction} post-tax deduction. What is net pay?`,
        correctValue: Number(net.toFixed(2)),
        tolerance: 0.5,
        unitHint: 'USD',
        explanation: `Taxable wages = $${gross} - $${pretax}. Taxes are 18% of taxable wages; subtract taxes and post-tax deduction.`
      };
    }
  },
  {
    title: 'FICA calculation',
    domain: 'Tax Laws and Regulations' as Domain,
    generate: (id: number) => {
      const wages = 950 + id * 22;
      const fica = wages * 0.0765;
      return {
        id: `calc-fica-${id}`,
        type: 'numeric' as const,
        domain: 'Tax Laws and Regulations' as Domain,
        difficulty: id % 3 === 0 ? 'Easy' : 'Medium',
        prompt: `An employee has taxable wages of $${wages}. Calculate the combined employee FICA withholding at 7.65%.`,
        correctValue: Number(fica.toFixed(2)),
        tolerance: 0.4,
        unitHint: 'USD',
        explanation: 'Multiply taxable wages by 0.0765 to get the FICA withholding.'
      };
    }
  },
  {
    title: 'Prorated salary',
    domain: 'Payroll Procedures and Calculations' as Domain,
    generate: (id: number) => {
      const annual = 52000 + id * 400;
      const daysWorked = 7 + (id % 6);
      const periodDays = 10;
      const daily = annual / 260;
      const pay = daily * daysWorked;
      return {
        id: `calc-pro-${id}`,
        type: 'numeric' as const,
        domain: 'Payroll Procedures and Calculations' as Domain,
        difficulty: id % 3 === 0 ? 'Medium' : 'Hard',
        prompt: `A salaried employee earns $${annual} annually based on 260 workdays. They start mid-period and work ${daysWorked} of ${periodDays} days. What is the prorated gross pay?`,
        correctValue: Number(pay.toFixed(2)),
        tolerance: 0.5,
        unitHint: 'USD',
        explanation: `Daily rate = annual ÷ 260. Multiply by ${daysWorked} days worked.`
      };
    }
  },
  {
    title: 'Retro pay adjustment',
    domain: 'Payroll Procedures and Calculations' as Domain,
    generate: (id: number) => {
      const oldRate = 20 + (id % 4);
      const newRate = oldRate + 1.5;
      const hours = 80 + (id % 5) * 2;
      const retro = (newRate - oldRate) * hours;
      return {
        id: `calc-retro-${id}`,
        type: 'numeric' as const,
        domain: 'Payroll Procedures and Calculations' as Domain,
        difficulty: 'Medium' as Difficulty,
        prompt: `A retroactive raise increased pay from $${oldRate}/hr to $${newRate}/hr for ${hours} hours already paid. What is the retro pay owed?`,
        correctValue: Number(retro.toFixed(2)),
        tolerance: 0.25,
        unitHint: 'USD',
        explanation: `Retro pay = (new rate - old rate) × hours.`
      };
    }
  }
];

const staticQuestions: Question[] = [
  {
    id: 'concept-1',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Easy',
    prompt: 'Which form is commonly used to report an employee’s withholding allowances and filing status?',
    options: ['W-2', 'W-4', 'I-9', '1099-NEC'],
    correctIndex: 1,
    explanation: 'Form W-4 provides withholding status and allowances to payroll.'
  },
  {
    id: 'concept-2',
    type: 'mcq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Medium',
    prompt: 'What is the primary purpose of maintaining a payroll audit trail?',
    options: [
      'To reduce tax liability',
      'To document changes and approvals for payroll transactions',
      'To limit employee access to self-service portals',
      'To avoid issuing corrected tax forms'
    ],
    correctIndex: 1,
    explanation: 'An audit trail captures approvals and changes to support compliance and investigations.'
  },
  {
    id: 'concept-3',
    type: 'msq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Medium',
    prompt: 'Which actions are typically part of a payroll system close process? (Select all that apply.)',
    options: ['Locking the pay period', 'Reconciling funding totals', 'Resetting time clocks', 'Running tax liability reports'],
    correctIndices: [0, 1, 3],
    explanation: 'Close involves locking the period, reconciling totals, and producing liability reports.'
  },
  {
    id: 'concept-4',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Easy',
    prompt: 'A payroll technician receives a request to release wage data to an employee’s manager. What is the best first step?',
    options: [
      'Share the data immediately to be helpful',
      'Verify that the manager has a legitimate business need and authorization',
      'Decline and refer the manager to HR without review',
      'Ask the employee for permission in every case'
    ],
    correctIndex: 1,
    explanation: 'Payroll data access should follow need-to-know and authorization policies.'
  },
  {
    id: 'concept-5',
    type: 'mcq',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Easy',
    prompt: 'What does gross pay represent?',
    options: ['Net earnings after taxes', 'Total earnings before deductions', 'Employer tax liability', 'Total hours worked'],
    correctIndex: 1,
    explanation: 'Gross pay is total earnings before deductions and taxes.'
  },
  {
    id: 'concept-6',
    type: 'mcq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Medium',
    prompt: 'Which record is essential to retain for payroll compliance?',
    options: ['Cafeteria menu', 'Timecard approvals', 'Marketing budget', 'Office supply invoices'],
    correctIndex: 1,
    explanation: 'Time and attendance records support payroll accuracy and compliance.'
  },
  {
    id: 'concept-7',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Hard',
    prompt: 'Which tax form reports wages and taxes to the Social Security Administration?',
    options: ['Form 941', 'Form W-2', 'Form 940', 'Form 1095-C'],
    correctIndex: 1,
    explanation: 'The W-2 reports wages and taxes for each employee.'
  },
  {
    id: 'concept-8',
    type: 'msq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Medium',
    prompt: 'Select the items that should be part of a payroll reconciliation checklist.',
    options: ['Bank funding totals', 'Payroll register totals', 'Employee badge photos', 'Tax liability reports'],
    correctIndices: [0, 1, 3],
    explanation: 'Reconciliation focuses on totals and liabilities, not unrelated assets.'
  },
  {
    id: 'concept-9',
    type: 'mcq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Easy',
    prompt: 'What is the primary benefit of a payroll system edit report?',
    options: [
      'Provides employee self-service features',
      'Highlights anomalies or out-of-policy entries before processing',
      'Eliminates the need for approvals',
      'Automates garnishment calculations'
    ],
    correctIndex: 1,
    explanation: 'Edit reports catch anomalies before payroll finalization.'
  },
  {
    id: 'concept-10',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Medium',
    prompt: 'A coworker asks you to look up their friend’s salary “just out of curiosity.” What should you do?',
    options: [
      'Provide the information verbally',
      'Direct them to the company’s open-payroll list',
      'Decline and explain confidentiality requirements',
      'Share the information only if they promise discretion'
    ],
    correctIndex: 2,
    explanation: 'Salary data is confidential and should only be shared with authorized parties.'
  },
  {
    id: 'concept-11',
    type: 'fill',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Easy',
    prompt: 'Fill in the blank: FUTA applies to the first $7,____ of wages in most cases.',
    correctAnswer: '000',
    explanation: 'The FUTA wage base is typically $7,000.'
  },
  {
    id: 'concept-12',
    type: 'order',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Medium',
    prompt: 'Put the payroll processing steps in the correct order.',
    options: ['Collect time data', 'Validate inputs', 'Calculate payroll', 'Review and approve', 'Disburse wages'],
    correctOrder: [0, 1, 2, 3, 4],
    explanation: 'Gather time, validate, calculate, review/approve, then disburse.'
  },
  {
    id: 'concept-13',
    type: 'match',
    domain: 'Payroll Software and Systems',
    difficulty: 'Medium',
    prompt: 'Match each payroll system feature to its description.',
    rows: ['Audit trail', 'Self-service portal', 'Workflow approvals'],
    options: ['Employees update personal data', 'Tracks changes and history', 'Routes payroll changes for sign-off'],
    correctMatches: [1, 0, 2],
    explanation: 'Audit trail tracks changes, self-service lets employees update data, workflow approvals route changes.'
  },
  {
    id: 'scenario-1',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'An employee is upset about a missing shift differential. What should you do first?',
    options: [
      'Issue an off-cycle payment immediately',
      'Review time records and policy to confirm eligibility',
      'Tell them to wait until next pay period',
      'Escalate to legal right away'
    ],
    correctIndex: 1,
    explanation: 'Verify records and policy before making adjustments.'
  },
  {
    id: 'scenario-2',
    type: 'mcq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Hard',
    scenario: true,
    prompt: 'A supervisor asks to modify an employee’s timecard after payroll has closed. What is the best response?',
    options: [
      'Reopen payroll without documentation',
      'Document the request and follow the established adjustment process',
      'Decline and ignore the request',
      'Make the change and delete the audit trail'
    ],
    correctIndex: 1,
    explanation: 'Use documented adjustment processes to preserve compliance and audit trails.'
  },
  {
    id: 'scenario-3',
    type: 'msq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'Your payroll system is down on processing day. What are the most appropriate immediate actions?',
    options: ['Notify stakeholders', 'Contact the vendor support line', 'Skip payroll', 'Prepare contingency calculations'],
    correctIndices: [0, 1, 3],
    explanation: 'Communication, vendor support, and contingency plans keep payroll on track.'
  },
  {
    id: 'scenario-4',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Easy',
    scenario: true,
    prompt: 'An employee asks for a pay stub via email. What is the best approach?',
    options: [
      'Send it unencrypted for speed',
      'Share it through secure self-service or encrypted delivery',
      'Refuse to provide any pay stubs',
      'Mail it to their home without confirmation'
    ],
    correctIndex: 1,
    explanation: 'Pay stubs should be shared through secure channels.'
  },
  {
    id: 'scenario-5',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'A new employee claims they are exempt from federal income tax. What should payroll do?',
    options: [
      'Accept the claim without documentation',
      'Require a completed W-4 with exemption and verify requirements',
      'Refuse to onboard the employee',
      'Automatically withhold at the highest rate'
    ],
    correctIndex: 1,
    explanation: 'Exemption claims must be documented on the W-4 and meet requirements.'
  },
  {
    id: 'scenario-6',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'A manager asks you to delay a termination payout to hit next quarter’s budget. What should you do?',
    options: [
      'Agree to the delay for budgeting purposes',
      'Decline and follow wage payment timing rules',
      'Wait until the employee calls',
      'Ask the employee to sign a waiver'
    ],
    correctIndex: 1,
    explanation: 'Final pay timing is governed by policy and law, not budgeting preferences.'
  },
  {
    id: 'scenario-7',
    type: 'mcq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Hard',
    scenario: true,
    prompt: 'During payroll processing, a batch upload fails. What should you do first?',
    options: [
      'Re-enter all data manually without checking logs',
      'Review the error log and validate file formatting',
      'Ignore the issue and process partial data',
      'Disable audit controls temporarily'
    ],
    correctIndex: 1,
    explanation: 'Error logs pinpoint formatting or mapping issues in batch uploads.'
  },
  {
    id: 'scenario-8',
    type: 'mcq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'A state agency requests payroll records for an audit. What is the best response?',
    options: [
      'Provide the records and document the release',
      'Refuse to provide anything',
      'Delete sensitive records first',
      'Delay until the audit ends'
    ],
    correctIndex: 0,
    explanation: 'Provide requested records promptly and document the release per policy.'
  },
  {
    id: 'scenario-9',
    type: 'mcq',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Medium',
    scenario: true,
    prompt: 'An employee reports a missing shift. What should you verify to resolve it?',
    options: [
      'Time entries, pay code mapping, and approval status',
      'Only the employee’s manager name',
      'Only the payroll tax table',
      'The employee’s mailing address'
    ],
    correctIndex: 0,
    explanation: 'Verify time entry, pay code mapping, and approvals to resolve missing shift pay.'
  },
  {
    id: 'scenario-10',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Hard',
    scenario: true,
    prompt: 'An employee moves to a new state mid-quarter. What should payroll do?',
    options: [
      'Continue withholding for the old state indefinitely',
      'Update tax setup to the new state and allocate wages accordingly',
      'Withhold no state taxes',
      'Ignore the change until year-end'
    ],
    correctIndex: 1,
    explanation: 'Payroll must update state tax setup and allocate wages to the correct jurisdiction.'
  },
  {
    id: 'concept-14',
    type: 'mcq',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Medium',
    prompt: 'Which deduction is taken after taxes?',
    options: ['401(k)', 'Health insurance premium', 'Roth retirement contribution', 'HSA contribution'],
    correctIndex: 2,
    explanation: 'Roth contributions are post-tax deductions.'
  },
  {
    id: 'concept-15',
    type: 'mcq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Easy',
    prompt: 'Why should payroll systems have role-based access controls?',
    options: [
      'To make data entry faster',
      'To reduce data retention requirements',
      'To ensure users only access what they need',
      'To eliminate approvals'
    ],
    correctIndex: 2,
    explanation: 'Role-based access protects confidential payroll data.'
  },
  {
    id: 'concept-16',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Easy',
    prompt: 'Professional payroll communication should be:',
    options: ['Vague to avoid liability', 'Timely, clear, and respectful', 'Only verbal', 'Shared publicly'],
    correctIndex: 1,
    explanation: 'Clear, timely, respectful communication builds trust.'
  },
  {
    id: 'concept-17',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Medium',
    prompt: 'When an employee changes their W-4, when should the new withholding take effect?',
    options: ['Immediately upon receipt', 'Next calendar year only', 'After employee approval only', 'After the end of the quarter'],
    correctIndex: 0,
    explanation: 'W-4 changes should apply as soon as administratively possible.'
  },
  {
    id: 'concept-18',
    type: 'msq',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Medium',
    prompt: 'Which earnings are typically included in regular rate calculations? (Select all that apply.)',
    options: ['Shift differentials', 'Discretionary bonuses', 'Non-discretionary bonuses', 'On-call pay'],
    correctIndices: [0, 2, 3],
    explanation: 'Non-discretionary bonuses, shift differentials, and on-call pay often count toward regular rate.'
  },
  {
    id: 'concept-19',
    type: 'mcq',
    domain: 'Compliance and Recordkeeping',
    difficulty: 'Easy',
    prompt: 'Why should payroll retain signed policy acknowledgments?',
    options: [
      'To lower payroll taxes',
      'To document employee awareness of pay policies',
      'To remove the need for pay stubs',
      'To justify overtime denial'
    ],
    correctIndex: 1,
    explanation: 'Acknowledgments document that employees understood policies.'
  },
  {
    id: 'concept-20',
    type: 'mcq',
    domain: 'Payroll Software and Systems',
    difficulty: 'Hard',
    prompt: 'Which integration risk is most important when connecting payroll to HRIS?',
    options: [
      'Color palette mismatch',
      'Data mapping errors for pay codes',
      'Delayed employee onboarding',
      'Duplicate job postings'
    ],
    correctIndex: 1,
    explanation: 'Incorrect data mapping can misclassify pay codes and cause compliance issues.'
  },
  {
    id: 'fun-1',
    type: 'mcq',
    domain: 'Payroll Procedures and Calculations',
    difficulty: 'Easy',
    prompt: 'A trainer in a creature-collecting game says, “track every point.” What payroll task matches that advice?',
    options: ['Skip rounding rules', 'Maintain accurate time punches', 'Ignore shift differentials', 'Only track salary staff'],
    correctIndex: 1,
    explanation: 'Accurate time punches ensure every hour is captured for pay.'
  },
  {
    id: 'fun-2',
    type: 'mcq',
    domain: 'Ethical Considerations and Customer Service',
    difficulty: 'Medium',
    prompt: 'A training captain says “honor the code.” In payroll, what’s the equivalent?',
    options: ['Share data freely', 'Follow confidentiality and policy', 'Ignore approvals', 'Delay wage corrections'],
    correctIndex: 1,
    explanation: 'Confidentiality and policy adherence are core to payroll ethics.'
  },
  {
    id: 'fun-3',
    type: 'mcq',
    domain: 'Tax Laws and Regulations',
    difficulty: 'Medium',
    prompt: 'A tribute in a survival tournament has to plan for every tax. What does payroll need to plan?',
    options: ['Only federal income tax', 'All required tax withholdings and deposits', 'Just employer taxes', 'Only state unemployment'],
    correctIndex: 1,
    explanation: 'Payroll plans for all required withholdings and deposits.'
  }
];

const generateQuestions = () => {
  const generated: Question[] = [];
  calculationTemplates.forEach((template, index) => {
    const count = index === 0 ? 25 : index === 1 ? 18 : index === 2 ? 12 : index === 3 ? 12 : 10;
    for (let i = 0; i < count; i += 1) {
      generated.push(template.generate(i + 1));
    }
  });

  const orderExtras: Question[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `order-extra-${i}`,
    type: 'order',
    domain: domains[i % domains.length],
    difficulty: i % 2 === 0 ? 'Easy' : 'Medium',
    prompt: 'Order the steps for resolving a payroll discrepancy.',
    options: ['Acknowledge request', 'Review records', 'Determine correction', 'Communicate outcome', 'Document resolution'],
    correctOrder: [0, 1, 2, 3, 4],
    explanation: 'Start by acknowledging, then review, correct, communicate, and document.'
  }));

  const matchExtras: Question[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `match-extra-${i}`,
    type: 'match',
    domain: domains[i % domains.length],
    difficulty: 'Medium',
    prompt: 'Match the report to its payroll purpose.',
    rows: ['Payroll register', 'Tax liability report', 'Deduction report'],
    options: ['Shows taxes owed', 'Lists employee deductions', 'Summarizes gross-to-net'],
    correctMatches: [2, 0, 1],
    explanation: 'Register summarizes gross-to-net, liability report shows taxes, deduction report lists deductions.'
  }));

  const fillExtras: Question[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `fill-extra-${i}`,
    type: 'fill',
    domain: domains[(i + 2) % domains.length],
    difficulty: 'Easy',
    prompt: 'Fill in the blank: Payroll must retain records for at least ____ years under typical federal guidance.',
    correctAnswer: '3',
    explanation: 'Many federal requirements call for retention of at least 3 years.'
  }));

  return [...generated, ...orderExtras, ...matchExtras, ...fillExtras];
};

const bank: Question[] = [...staticQuestions, ...generateQuestions()];

export const getQuestionBank = (seed?: string) => {
  const list = [...bank];
  return seed ? seededShuffle(list, seed) : list;
};

export const questionStats = () => {
  return bank.reduce(
    (acc, question) => {
      acc.total += 1;
      acc.domain[question.domain] = (acc.domain[question.domain] ?? 0) + 1;
      acc.type[question.type] = (acc.type[question.type] ?? 0) + 1;
      return acc;
    },
    {
      total: 0,
      domain: {} as Record<Domain, number>,
      type: {} as Record<string, number>
    }
  );
};
