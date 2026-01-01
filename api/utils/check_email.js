export default function checkEmail(email) {
  if (typeof email !== 'string') { throw new TypeError('the email is not a string'); }
  if (!email.endsWith('gmail.com')) { throw new Error('The email must be a valid email address'); }
}
