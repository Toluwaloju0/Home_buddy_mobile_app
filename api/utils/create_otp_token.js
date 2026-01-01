const otp_list = "1234567890abcdefghijklmnopqrstuvwxyz";

export default function () {
  let otp_string = "";

  for (let a = 0; a < 6; a++) {
    let x = Math.floor((Math.random() * otp_list.length));

    otp_string += otp_list[x];
  }
  return otp_string;
}