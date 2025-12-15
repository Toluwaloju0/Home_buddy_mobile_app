import services from '../../services/index.js';

const { ValidationService } = services;

export default async function (req, res) {
  const { UserId } = req;
  const { otpCode } = req.body;

  if (!otpCode) { return res.status(500).json({
    error: "The OTP code is not provied",
  })}

  try {
    await ValidationService.validateUser(UserId, otpCode);
    return res.status(200).json({
      message: "User validated successfully",
    })
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }

}