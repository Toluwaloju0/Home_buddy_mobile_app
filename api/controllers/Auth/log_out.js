/**
 * 
 * @param {Request} request 
 * @param {Response} response 
 * @returns 
 * 
 * log the user out from the API
 * delete the access token and refresh token
 * sends a log out message to the user
 */

export default async function (request, response) {
  return response.clearCookie('token').status(200).json({ status: 'Logged out successfully' });
}
