import { FinancialRulesService } from './financialRulesService';

export class CalculationEngine {
  
  // 1. EMI Calculator
  public static calculateEMI(P: number, ratePct: number, tenureMonths: number) {
    const P_valid = Math.max(1000, P);
    const r = ratePct / 12 / 100;
    const n = Math.max(1, tenureMonths);

    let monthlyEmi = 0;
    if (r > 0) {
      monthlyEmi = (P_valid * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyEmi = P_valid / n;
    }

    const totalRepayment = monthlyEmi * n;
    const totalInterest = Math.max(0, totalRepayment - P_valid);

    return {
      monthlyEmi: Math.round(monthlyEmi),
      principalAmount: Math.round(P_valid),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(totalRepayment)
    };
  }

  // 2. SIP Calculator
  public static calculateSIP(monthlyInvest: number, ratePct: number, tenureYears: number) {
    const P = Math.max(100, monthlyInvest);
    const i = ratePct / 12 / 100;
    const n = Math.max(1, tenureYears * 12);

    const totalInvested = P * n;
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const estimatedReturns = Math.max(0, totalValue - totalInvested);

    return {
      totalInvested: Math.round(totalInvested),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue)
    };
  }

  // 3. Lumpsum Calculator
  public static calculateLumpsum(initialInvest: number, ratePct: number, tenureYears: number) {
    const P = Math.max(1000, initialInvest);
    const n = Math.max(1, tenureYears);
    const totalValue = P * Math.pow(1 + ratePct / 100, n);
    const estimatedReturns = Math.max(0, totalValue - P);

    return {
      totalInvested: Math.round(P),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue)
    };
  }

  // 4. FD Calculator
  public static calculateFD(depositAmount: number, ratePct: number, tenureYears: number, compoundingFreq: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly', isCumulative: boolean = true) {
    const P = Math.max(1000, depositAmount);
    const r = ratePct / 100;
    const t = Math.max(0.1, tenureYears);
    
    let n = 4; // default quarterly
    if (compoundingFreq === 'Monthly') n = 12;
    if (compoundingFreq === 'Half-Yearly') n = 2;
    if (compoundingFreq === 'Yearly') n = 1;

    let maturityAmount = 0;
    let totalInterest = 0;

    if (isCumulative) {
      maturityAmount = P * Math.pow(1 + r / n, n * t);
      totalInterest = maturityAmount - P;
    } else {
      totalInterest = P * r * t;
      maturityAmount = P + totalInterest;
    }

    return {
      depositAmount: Math.round(P),
      interestEarned: Math.round(totalInterest),
      maturityAmount: Math.round(maturityAmount)
    };
  }

  // 5. RD Calculator
  public static calculateRD(monthlyDeposit: number, ratePct: number, tenureYears: number) {
    const P = Math.max(500, monthlyDeposit);
    const n = Math.max(1, tenureYears * 12);
    const r = ratePct / 100;

    let totalInterest = 0;
    // Formula for RD interest: I = P * N*(N+1)/2 * (R/12) / 100
    totalInterest = (P * n * (n + 1) * r) / (2 * 12);
    const totalDeposit = P * n;
    const maturityAmount = totalDeposit + totalInterest;

    return {
      totalDeposit: Math.round(totalDeposit),
      estimatedInterest: Math.round(totalInterest),
      maturityAmount: Math.round(maturityAmount)
    };
  }

  // 6. PPF Calculator (uses FinancialRulesService)
  public static calculatePPF(annualContribution: number, tenureYears: number = 15) {
    const ppfRules = FinancialRulesService.getPPFRules();
    const rate = ppfRules.interestRate / 100;
    const P = Math.min(ppfRules.maxAnnualContribution, Math.max(ppfRules.minAnnualContribution, annualContribution));

    let balance = 0;
    let totalInvested = 0;

    for (let y = 1; y <= tenureYears; y++) {
      balance += P;
      totalInvested += P;
      const interest = balance * rate;
      balance += interest;
    }

    return {
      totalInvested: Math.round(totalInvested),
      estimatedInterest: Math.round(balance - totalInvested),
      maturityAmount: Math.round(balance),
      applicableRate: ppfRules.interestRate
    };
  }

  // 7. EPF Calculator (uses FinancialRulesService)
  public static calculateEPF(basicSalary: number, currentBalance: number = 0, salaryGrowthPct: number = 5, serviceYears: number = 30) {
    const epfRules = FinancialRulesService.getEPFRules();
    const rate = epfRules.interestRate / 100;

    let currentSalary = basicSalary;
    let balance = currentBalance;
    let totalEmployeeContrib = 0;
    let totalEmployerContrib = 0;

    for (let y = 1; y <= serviceYears; y++) {
      const annualBasic = currentSalary * 12;
      const empContribAnnual = annualBasic * (epfRules.employeeContributionPercent / 100);
      const emprContribAnnual = annualBasic * (3.67 / 100); // 3.67% to EPF (8.33% goes to EPS)

      totalEmployeeContrib += empContribAnnual;
      totalEmployerContrib += emprContribAnnual;

      balance += (empContribAnnual + emprContribAnnual);
      const interestEarned = balance * rate;
      balance += interestEarned;

      currentSalary *= (1 + salaryGrowthPct / 100);
    }

    return {
      totalEmployeeContrib: Math.round(totalEmployeeContrib),
      totalEmployerContrib: Math.round(totalEmployerContrib),
      totalContrib: Math.round(totalEmployeeContrib + totalEmployerContrib),
      estimatedInterest: Math.round(balance - (totalEmployeeContrib + totalEmployerContrib + currentBalance)),
      projectedCorpus: Math.round(balance),
      applicableRate: epfRules.interestRate
    };
  }

  // 8. NPS Calculator (uses FinancialRulesService)
  public static calculateNPS(monthlyContrib: number, currentAge: number, retirementAge: number = 60, expReturnPct?: number, annuityRatePct?: number) {
    const npsRules = FinancialRulesService.getNPSRules();
    const retPct = expReturnPct || npsRules.expectedReturnPercent;
    const annPct = annuityRatePct || npsRules.expectedAnnuityRatePercent;

    const years = Math.max(1, retirementAge - currentAge);
    const months = years * 12;
    const P = Math.max(500, monthlyContrib);
    const i = retPct / 12 / 100;

    const totalContrib = P * months;
    const totalCorpus = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);

    const annuityPortion = totalCorpus * 0.40; // 40% mandatory annuity
    const lumpsumPortion = totalCorpus * 0.60; // 60% tax-free lumpsum

    // Monthly Pension from Annuity = AnnuityPortion * annuityRate / 12
    const monthlyPension = (annuityPortion * (annPct / 100)) / 12;

    return {
      totalContribution: Math.round(totalContrib),
      estimatedCorpus: Math.round(totalCorpus),
      annuityPortion: Math.round(annuityPortion),
      lumpsumPortion: Math.round(lumpsumPortion),
      monthlyPension: Math.round(monthlyPension)
    };
  }

  // 9. CAGR Calculator
  public static calculateCAGR(initialVal: number, finalVal: number, periodYears: number) {
    const V_i = Math.max(1, initialVal);
    const V_f = Math.max(1, finalVal);
    const n = Math.max(0.1, periodYears);

    const cagr = (Math.pow(V_f / V_i, 1 / n) - 1) * 100;
    const totalGrowth = V_f - V_i;

    return {
      initialValue: Math.round(V_i),
      finalValue: Math.round(V_f),
      totalGrowth: Math.round(totalGrowth),
      cagrPercent: Number(cagr.toFixed(2))
    };
  }

  // 10. Compound Interest Calculator
  public static calculateCompoundInterest(P: number, ratePct: number, tenureYears: number, compoundingFreq: 'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly') {
    const r = ratePct / 100;
    const t = Math.max(0.1, tenureYears);
    let n = 1;

    if (compoundingFreq === 'Daily') n = 365;
    if (compoundingFreq === 'Monthly') n = 12;
    if (compoundingFreq === 'Quarterly') n = 4;
    if (compoundingFreq === 'Half-Yearly') n = 2;
    if (compoundingFreq === 'Yearly') n = 1;

    const finalAmount = P * Math.pow(1 + r / n, n * t);
    const interestEarned = finalAmount - P;

    return {
      principal: Math.round(P),
      interestEarned: Math.round(interestEarned),
      finalAmount: Math.round(finalAmount)
    };
  }

  // 11. Simple Interest Calculator
  public static calculateSimpleInterest(P: number, ratePct: number, tenureYears: number) {
    const interest = (P * ratePct * tenureYears) / 100;
    const totalAmount = P + interest;

    return {
      principal: Math.round(P),
      simpleInterest: Math.round(interest),
      totalAmount: Math.round(totalAmount)
    };
  }

  // 12. Loan Eligibility Calculator
  public static calculateLoanEligibility(monthlyIncome: number, existingEmi: number = 0, interestRatePct: number = 8.5, tenureYears: number = 20) {
    const netIncome = Math.max(0, monthlyIncome - existingEmi);
    // Max FOIR (Fixed Obligation to Income Ratio) = 50%
    const maxAvailableEmi = netIncome * 0.50;

    const r = interestRatePct / 12 / 100;
    const n = tenureYears * 12;

    let maxLoan = 0;
    if (r > 0) {
      maxLoan = (maxAvailableEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    }

    const dtiRatio = monthlyIncome > 0 ? Math.round((existingEmi / monthlyIncome) * 100) : 0;

    return {
      maxLoanEligibility: Math.round(maxLoan),
      estimatedEmi: Math.round(maxAvailableEmi),
      debtToIncomeRatio: dtiRatio
    };
  }

  // 13. Inflation Calculator
  public static calculateInflation(currentAmount: number, inflationRatePct: number, years: number) {
    const futureCost = currentAmount * Math.pow(1 + inflationRatePct / 100, years);
    const purchasingPowerLoss = futureCost - currentAmount;
    const purchasingPowerValue = currentAmount * Math.pow(1 - inflationRatePct / 100, years);

    return {
      currentAmount: Math.round(currentAmount),
      futureCost: Math.round(futureCost),
      purchasingPowerLoss: Math.round(purchasingPowerLoss),
      purchasingPowerValue: Math.round(purchasingPowerValue)
    };
  }

  // 14. GST Calculator
  public static calculateGST(amount: number, gstRatePct: number, mode: 'add' | 'remove') {
    let gstAmount = 0;
    let finalAmount = 0;
    let originalAmount = 0;

    if (mode === 'add') {
      originalAmount = amount;
      gstAmount = (amount * gstRatePct) / 100;
      finalAmount = amount + gstAmount;
    } else {
      finalAmount = amount;
      originalAmount = (amount * 100) / (100 + gstRatePct);
      gstAmount = finalAmount - originalAmount;
    }

    return {
      originalAmount: Math.round(originalAmount),
      gstAmount: Math.round(gstAmount),
      finalAmount: Math.round(finalAmount)
    };
  }

  // 15. Salary Calculator (Indian CTC Breakup)
  public static calculateSalary(annualCtc: number, basicPct: number = 50, hraPct: number = 20, specialAllowPct: number = 20, otherAllowPct: number = 10, epfMonthly: number = 1800, profTaxMonthly: number = 200, deductionsMonthly: number = 0) {
    const monthlyCtc = annualCtc / 12;

    const basicMonthly = (monthlyCtc * basicPct) / 100;
    const hraMonthly = (monthlyCtc * hraPct) / 100;
    const specialMonthly = (monthlyCtc * specialAllowPct) / 100;
    const otherMonthly = (monthlyCtc * otherAllowPct) / 100;

    const grossSalaryMonthly = basicMonthly + hraMonthly + specialMonthly + otherMonthly;
    const totalDeductionsMonthly = epfMonthly + profTaxMonthly + deductionsMonthly;

    const estimatedInHandMonthly = Math.max(0, grossSalaryMonthly - totalDeductionsMonthly);
    const annualInHand = estimatedInHandMonthly * 12;

    return {
      grossSalaryMonthly: Math.round(grossSalaryMonthly),
      totalDeductionsMonthly: Math.round(totalDeductionsMonthly),
      estimatedInHandMonthly: Math.round(estimatedInHandMonthly),
      annualInHand: Math.round(annualInHand)
    };
  }

  // 16. Income Tax Calculator (uses FinancialRulesService)
  public static calculateIncomeTax(grossIncome: number, deductionsTotal: number = 0, regime: 'new' | 'old' = 'new', fy: string = '2026-27') {
    const taxRules = FinancialRulesService.getIncomeTaxRules(fy);
    const rules = regime === 'new' ? taxRules.newRegime : taxRules.oldRegime;

    // Apply Standard Deduction
    let taxableIncome = Math.max(0, grossIncome - rules.standardDeduction - (regime === 'old' ? deductionsTotal : 0));

    // Calculate Slabs Tax
    let baseTax = 0;
    for (const slab of rules.slabs) {
      if (taxableIncome > slab.minIncome) {
        const slabUpper = slab.maxIncome === -1 ? taxableIncome : Math.min(taxableIncome, slab.maxIncome);
        const taxableAmountInSlab = slabUpper - slab.minIncome;
        baseTax += (taxableAmountInSlab * slab.rate) / 100;
      }
    }

    // Section 87A Rebate
    if (taxableIncome <= rules.rebateLimit) {
      baseTax = Math.max(0, baseTax - rules.rebateMaxAmount);
    }

    // Health & Education Cess
    const cessAmount = (baseTax * rules.cessRate) / 100;
    const totalTaxLiability = baseTax + cessAmount;
    const monthlyTax = totalTaxLiability / 12;

    return {
      grossIncome: Math.round(grossIncome),
      taxableIncome: Math.round(taxableIncome),
      baseTax: Math.round(baseTax),
      cessAmount: Math.round(cessAmount),
      totalTaxLiability: Math.round(totalTaxLiability),
      monthlyTax: Math.round(monthlyTax),
      applicableFy: fy,
      regimeName: regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'
    };
  }

  // 17. SIP vs Lumpsum Calculator
  public static calculateSipVsLumpsum(totalCapital: number, sipMonthly: number, ratePct: number, tenureYears: number) {
    const sipRes = this.calculateSIP(sipMonthly, ratePct, tenureYears);
    const lumpRes = this.calculateLumpsum(totalCapital, ratePct, tenureYears);

    const diffValue = lumpRes.totalValue - sipRes.totalValue;

    return {
      sipTotalInvested: sipRes.totalInvested,
      sipFinalValue: sipRes.totalValue,
      lumpsumTotalInvested: lumpRes.totalInvested,
      lumpsumFinalValue: lumpRes.totalValue,
      valueDifference: Math.abs(diffValue),
      winner: diffValue >= 0 ? 'lumpsum' : 'sip'
    };
  }

  // 18. SWP Calculator (Systematic Withdrawal Plan)
  public static calculateSWP(initialInvestment: number, monthlyWithdrawal: number, ratePct: number, tenureYears: number) {
    let balance = initialInvestment;
    const monthlyRate = ratePct / 12 / 100;
    const months = tenureYears * 12;

    let totalWithdrawals = 0;

    for (let m = 1; m <= months; m++) {
      if (balance <= 0) break;
      const interest = balance * monthlyRate;
      balance = balance + interest - monthlyWithdrawal;
      totalWithdrawals += monthlyWithdrawal;
    }

    const remainingCorpus = Math.max(0, balance);

    return {
      initialInvestment: Math.round(initialInvestment),
      totalWithdrawals: Math.round(totalWithdrawals),
      remainingCorpus: Math.round(remainingCorpus)
    };
  }

  // 19. Retirement Calculator
  public static calculateRetirement(currentAge: number, retirementAge: number = 60, currentMonthlyExpenses: number = 50000, inflationPct: number = 6, currentSavings: number = 500000, monthlyInvestment: number = 10000, returnRatePct: number = 12, lifeExpectancy: number = 85) {
    const yearsToRetire = Math.max(1, retirementAge - currentAge);

    // Future monthly expenses at retirement: Exp * (1 + infl)^years
    const futureMonthlyExpenses = currentMonthlyExpenses * Math.pow(1 + inflationPct / 100, yearsToRetire);

    // Corpus required to sustain expenses from retirement to life expectancy
    const retirementYears = Math.max(1, lifeExpectancy - retirementAge);
    const requiredCorpus = futureMonthlyExpenses * 12 * retirementYears;

    // Projected savings from current savings + future monthly investments
    const currentSavingsGrowth = currentSavings * Math.pow(1 + returnRatePct / 100, yearsToRetire);
    const sipRes = this.calculateSIP(monthlyInvestment, returnRatePct, yearsToRetire);

    const estimatedCorpus = currentSavingsGrowth + sipRes.totalValue;
    const shortfallOrSurplus = estimatedCorpus - requiredCorpus;

    return {
      futureMonthlyExpenses: Math.round(futureMonthlyExpenses),
      requiredCorpus: Math.round(requiredCorpus),
      estimatedCorpus: Math.round(estimatedCorpus),
      shortfallOrSurplus: Math.round(shortfallOrSurplus),
      isSurplus: shortfallOrSurplus >= 0
    };
  }

  // 20. Net Worth Calculator
  public static calculateNetWorth(assets: Record<string, number>, liabilities: Record<string, number>) {
    const totalAssets = Object.values(assets).reduce((a, b) => a + (b || 0), 0);
    const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + (b || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalAssets: Math.round(totalAssets),
      totalLiabilities: Math.round(totalLiabilities),
      netWorth: Math.round(netWorth)
    };
  }

}
