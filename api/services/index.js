import UserService from './users/index.js';
import TokenService from './jwt_auth/index.js';
import PasswordService from './Password/index.js';
// import checkEmail from './check_email.js';
import SellerService from './sellers/index.js';
import ValidationService from './validation/index.js';
import RefreshService from './refresh/index.js';


export default {
  UserService,
  TokenService,
  PasswordService,
  SellerService,
  ValidationService,
  RefreshService,
};