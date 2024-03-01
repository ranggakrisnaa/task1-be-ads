const OTPAuth = require('otpauth')

class OtpauthUtil {

    static totp = new OTPAuth.TOTP({
        issuer: "ACME",
        label: "AzureDiamond",
        algorithm: "SHA1",
        digits: 6,
        period: 180,
        secret: "NB2W45DFOIZA",
    });

    static generateTOTP() {
        return this.totp.generate();
    }

    static validateTOTP(token) {
        return this.totp.validate({ token, window: 1 });;
    }

}

module.exports = OtpauthUtil