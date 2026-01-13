export default function (phoneNumber) {
  stringChecker = '1234567890';

  for (char in phoneNumber) {
    if (!stringChecker.includes(char)) { throw new Error('the number is not a valid number'); }
  }
  if (stringChecker.length !== 11) { throw new Error('the string length is not accurate'); }
}