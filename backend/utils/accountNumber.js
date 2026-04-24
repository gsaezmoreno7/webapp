/**
 * Genera un número de cuenta bancario único.
 * Formato: XXXX-XXXX-XXXX (12 dígitos agrupados)
 * @returns {string}
 */
function generateAccountNumber() {
  const digits = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `${digits()}-${digits()}-${digits()}`;
}

module.exports = { generateAccountNumber };
