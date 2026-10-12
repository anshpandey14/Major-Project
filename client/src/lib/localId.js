export const createLocalId = (prefix) => {
  return `local-${prefix}-${crypto.randomUUID()}`;
};
