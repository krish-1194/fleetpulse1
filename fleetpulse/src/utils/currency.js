const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatINR = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return INR_FORMATTER.format(0);
  }
  return INR_FORMATTER.format(numericValue);
};


