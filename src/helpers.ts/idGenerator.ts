export const generateCustomId = (prefix: string): string => {
  const digits = Math.floor(100000 + Math.random() * 900000); // 6-digit number
  return `${prefix}-${digits}`;
};

export const generateTransactionId = (): string => {
  return generateCustomId('TNX');
};

export const generateInvoiceNumber = (): string => {
  return generateCustomId('INV');
};
