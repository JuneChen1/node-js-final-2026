function isValidString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

module.exports = { isValidString };
