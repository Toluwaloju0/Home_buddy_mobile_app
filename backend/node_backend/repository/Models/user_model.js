import { model } from 'mongoose';
import Schema from '../Schemas/index.js';

const User = model('user', Schema.UserSchema);

export default User;