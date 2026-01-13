/**
 * 
 * @param {RequestInfo} req 
 * @param {Response} res 
 * 
 * add a house to the database along with it seller id
 * get the house images such as the bedroom, bathroom, palour, kitchen, compound and all neccessary information and store them all into the database
 * store all uploaded url into the database house document
 * send an email to the seller stating the house information successfully stored in the database
 * 
 */
export default async function (req, res) {
  console.log("the endpoint to upload a file into the system\n\n");

  console.log(req.body)
  res.send('done');
}