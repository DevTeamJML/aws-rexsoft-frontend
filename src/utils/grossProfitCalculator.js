/**
 * Handle gross profit calculation
 * Total Expenses = Campaign Price - Expenses Amount
 * @param {*} expenses - total expenses in the form of array
 * @param {*} price - total campaign price in the form of string/number
 * @returns 
 */
export function grossProfitCalculator(expenses, price){
     const totalExpenses = expenses.reduce((acc, curr) => {
      const expensesAmount = Number(curr.value);
      return acc + expensesAmount;
    }, 0);

    const campaignPrice = price;
    const grossProfit = campaignPrice - totalExpenses;

    // return as 2 decimal places
    return Math.round(grossProfit * 100) / 100;
}