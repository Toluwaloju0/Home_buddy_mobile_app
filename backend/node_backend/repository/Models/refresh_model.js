import { model } from 'mongoose';
import Schemas from '../Schemas/index.js';

export default model("refresh_tokens", Schemas.RefreshTokenSchema) 