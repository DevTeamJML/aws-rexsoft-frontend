/**
 * Handle number format of a money amount
 * (E.g. 39000 -> 39,000.00)
 * @param {*} amount - Amount to be formatted in the form of Number
 * @returns 
 */
export function moneyAmountFomatter(amount) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
}