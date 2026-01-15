
export const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If it's more than 10 digits, take the last 10
  if (cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  
  return cleaned;
};
