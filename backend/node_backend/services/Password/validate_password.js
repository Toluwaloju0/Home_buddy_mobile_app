export default function validatePassword(password) {
  let length = false;
  let upper = false;
  let lower = false;
  let specialOrNumber = false;

  if (password.length > 8) length = true;
  for (const char of password) {
    if (char >= "A" && char <= "Z") upper = true;
    else if (char >= "a" && char <= "z") lower = true;
    else specialOrNumber = true; // number OR symbol
  }

  return upper && lower && specialOrNumber && length;
}
