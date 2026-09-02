import { ComparisonCatalogService } from './comparisonCatalogService';
import { CreditCardItem, MutualFundItem } from '../types/comparisons';

export class ComparisonEngine {
  
  // 1. SIP vs FD Comparison
  public static compareSipVsFd(monthlySip: number, sipRatePct: number, fdAmount: number, fdRatePct: number, tenureYears: number) {
    const months = tenureYears * 12;

    // SIP Calculation
    const sipP = Math.max(100, monthlySip);
    const sipI = sipRatePct / 12 / 100;
    const sipInvested = sipP * months;
    const sipValue = sipP * ((Math.pow(1 + sipI, months) - 1) / sipI) * (1 + sipI);

    // FD Calculation (Normalized or entered FD Amount)
    const fdP = Math.max(1000, fdAmount);
    const fdR = fdRatePct / 100;
    // Quarterly compounding
    const fdValue = fdP * Math.pow(1 + fdR / 4, 4 * tenureYears);
    const fdInterest = fdValue - fdP;

    const diff = sipValue - fdValue;

    return {
      sip: {
        invested: Math.round(sipInvested),
        returns: Math.round(sipValue - sipInvested),
        value: Math.round(sipValue)
      },
      fd: {
        principal: Math.round(fdP),
        interest: Math.round(fdInterest),
        value: Math.round(fdValue)
      },
      difference: Math.round(Math.abs(diff)),
      higherReturnsOption: diff >= 0 ? 'SIP' : 'FD'
    };
  }

  // 2. FD vs Debt Fund Comparison
  public static compareFdVsDebtFund(amount: number, fdRatePct: number, debtExpReturnPct: number, tenureYears: number, expenseRatioPct: number = 0.5) {
    const P = Math.max(1000, amount);
    
    // FD (Quarterly Compounding)
    const fdValue = P * Math.pow(1 + (fdRatePct / 100) / 4, 4 * tenureYears);
    const fdInterest = fdValue - P;

    // Debt Fund (Net Return = Return - Expense Ratio)
    const netDebtReturn = Math.max(0.1, debtExpReturnPct - expenseRatioPct);
    const debtValue = P * Math.pow(1 + netDebtReturn / 100, tenureYears);
    const debtGrowth = debtValue - P;

    return {
      fd: {
        principal: Math.round(P),
        interest: Math.round(fdInterest),
        maturityValue: Math.round(fdValue),
        riskIndicator: 'Low / Guaranteed Rate'
      },
      debtFund: {
        investment: Math.round(P),
        estimatedGrowth: Math.round(debtGrowth),
        estimatedValue: Math.round(debtValue),
        netReturnRate: Number(netDebtReturn.toFixed(2)),
        riskIndicator: 'Low to Moderate / Market Linked'
      },
      difference: Math.round(Math.abs(debtValue - fdValue)),
      betterValueOption: debtValue >= fdValue ? 'Debt Fund' : 'Fixed Deposit'
    };
  }

  // 3. Rent vs Buy Comparison
  public static compareRentVsBuy(propPrice: number, downPayPct: number, loanRatePct: number, loanYears: number, propApprecPct: number, monthlyRent: number, rentIncPct: number, savingsReturnPct: number, holdingYears: number) {
    const downPayAmt = (propPrice * downPayPct) / 100;
    const loanAmt = Math.max(0, propPrice - downPayAmt);

    // Loan EMI
    const r = loanRatePct / 12 / 100;
    const n = loanYears * 12;
    const emi = r > 0 ? (loanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loanAmt / n;

    // BUY Cost Calculation over Holding Years
    const totalEmiPaid = emi * Math.min(holdingYears * 12, n);
    const propertyCost = downPayAmt + totalEmiPaid;
    const estimatedPropValue = propPrice * Math.pow(1 + propApprecPct / 100, holdingYears);
    const buyNetPosition = estimatedPropValue - propertyCost;

    // RENT Cost Calculation over Holding Years
    let currentRent = monthlyRent;
    let totalRentPaid = 0;
    for (let y = 1; y <= holdingYears; y++) {
      totalRentPaid += currentRent * 12;
      currentRent *= (1 + rentIncPct / 100);
    }

    // Opportunity Cost: Down payment + (EMI - Rent) invested in savings
    const monthlySavingsDiff = Math.max(0, emi - monthlyRent);
    const savingsRate = savingsReturnPct / 12 / 100;
    const months = holdingYears * 12;

    const downPayGrowth = downPayAmt * Math.pow(1 + savingsReturnPct / 100, holdingYears);
    const sipGrowth = monthlySavingsDiff > 0 
      ? monthlySavingsDiff * ((Math.pow(1 + savingsRate, months) - 1) / savingsRate) * (1 + savingsRate)
      : 0;

    const rentInvestmentValue = downPayGrowth + sipGrowth;
    const rentNetPosition = rentInvestmentValue - totalRentPaid;

    const netDifference = Math.round(Math.abs(buyNetPosition - rentNetPosition));
    const financiallyFavorable = buyNetPosition >= rentNetPosition ? 'BUYING' : 'RENTING';

    return {
      buy: {
        downPayment: Math.round(downPayAmt),
        loanEmi: Math.round(emi),
        totalCost: Math.round(propertyCost),
        estimatedPropValue: Math.round(estimatedPropValue),
        netPosition: Math.round(buyNetPosition)
      },
      rent: {
        totalRentPaid: Math.round(totalRentPaid),
        investmentValue: Math.round(rentInvestmentValue),
        netPosition: Math.round(rentNetPosition)
      },
      financialDifference: netDifference,
      financiallyFavorable
    };
  }

  // 4. Loan A vs Loan B Comparison
  public static compareLoans(amountA: number, rateA: number, yearsA: number, feeA: number, amountB: number, rateB: number, yearsB: number, feeB: number) {
    const calcLoan = (amt: number, ratePct: number, yrs: number, fee: number) => {
      const P = Math.max(1000, amt);
      const r = ratePct / 12 / 100;
      const n = yrs * 12;
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalRepay = emi * n;
      const totalInterest = totalRepay - P;
      const totalCost = totalInterest + fee;

      return {
        loanAmount: Math.round(P),
        monthlyEmi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        processingFee: Math.round(fee),
        totalCost: Math.round(totalCost),
        totalRepayment: Math.round(totalRepay + fee)
      };
    };

    const loanA = calcLoan(amountA, rateA, yearsA, feeA);
    const loanB = calcLoan(amountB, rateB, yearsB, feeB);

    const costDiff = Math.abs(loanA.totalCost - loanB.totalCost);
    const lowerCostLoan = loanA.totalCost <= loanB.totalCost ? 'Loan A' : 'Loan B';

    return { loanA, loanB, costDifference: Math.round(costDiff), lowerCostLoan };
  }

  // 5. Credit Card Comparison
  public static compareCreditCards(cardA: CreditCardItem, cardB: CreditCardItem, monthlySpendOnline: number, monthlySpendTravel: number, monthlySpendFuel: number, monthlySpendDining: number) {
    const calcBenefit = (card: CreditCardItem) => {
      const totalAnnualSpend = (monthlySpendOnline + monthlySpendTravel + monthlySpendFuel + monthlySpendDining) * 12;
      
      const onlineRewards = (monthlySpendOnline * 12 * (card.cashbackRatePct / 100));
      const travelRewards = (monthlySpendTravel * 12 * (card.rewardRatePct / 100));
      const fuelWaiver = card.fuelSurchargeWaiver ? (monthlySpendFuel * 12 * 0.01) : 0;
      const diningRewards = (monthlySpendDining * 12 * 0.02);

      const grossBenefit = onlineRewards + travelRewards + fuelWaiver + diningRewards;
      const isFeeWaived = totalAnnualSpend >= card.renewalFeeWaiverSpend && card.renewalFeeWaiverSpend > 0;
      const annualCost = isFeeWaived ? 0 : card.annualFee;

      const netAnnualBenefit = Math.max(0, grossBenefit - annualCost);

      return {
        grossBenefit: Math.round(grossBenefit),
        annualCost,
        isFeeWaived,
        netAnnualBenefit: Math.round(netAnnualBenefit)
      };
    };

    const benefitA = calcBenefit(cardA);
    const benefitB = calcBenefit(cardB);

    return { cardA, cardB, benefitA, benefitB };
  }

  // 6. Mutual Fund Comparison
  public static compareMutualFunds(fundA: MutualFundItem, fundB: MutualFundItem, monthlySip: number = 5000, years: number = 5) {
    const calcSipReturn = (fund: MutualFundItem) => {
      const rate = fund.return5Y > 0 ? fund.return5Y : fund.return3Y;
      const P = monthlySip;
      const i = rate / 12 / 100;
      const n = years * 12;
      const invested = P * n;
      const value = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      return {
        invested: Math.round(invested),
        projectedValue: Math.round(value),
        returns: Math.round(value - invested)
      };
    };

    const simA = calcSipReturn(fundA);
    const simB = calcSipReturn(fundB);

    return { fundA, fundB, simA, simB };
  }

}
