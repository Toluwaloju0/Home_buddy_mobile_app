import bcrypt from "bcrypt";

export default class Password {
    static async hasher(password) {
        // to hash the password given before storing it in database
        const saltRound = Number(process.env.SALT_ROUND) || 10;
        const hashed = await bcrypt.hash(password, saltRound);
        return hashed;
    }

    static async checker(password, encrypted) {
        // to check the given password
        const result = await bcrypt.compare(password, encrypted);
        return result;
    }
}