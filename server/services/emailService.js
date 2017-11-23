import log4js from "log4js";
import MailGun from "mailgun-js";
import RSVP from "rsvp";

import {mailConfig} from "../config";

const logger = log4js.getLogger("EmailService");

class EmailService {
    sendRegisterConfirmEmail(newUser) {
        logger.info("sendRegisterConfirmEmail", "Send Register Confirm Email");
        logger.info("api key", mailConfig.apiKey);
        const mailgun = MailGun({
            apiKey: mailConfig.apiKey,
            domain: mailConfig.domain
        });
        const message = {
            from: mailConfig.from,
            to: newUser.email,
            subject: "Welcome to login demo",
            text: `Thank you for registering. Please use the token below to activate your profile.\nToken:${newUser.confirmToken}`
        };
        const defer = RSVP.defer("sendRegisterConfirmEmail");
        mailgun.messages().send(message, (error, body) => {
            if (error) {
                logger.error("sendRegisterConfirmEmail", error);
                defer.reject(error);
            } else {
                defer.resolve(body);
            }
        });
        return defer;
    }
}

export default new EmailService();
