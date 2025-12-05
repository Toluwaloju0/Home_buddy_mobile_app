export default async function (request, response) {
  return response.clearCookie('token').status(200).json({ status: 'Logged out successfully' });
}
