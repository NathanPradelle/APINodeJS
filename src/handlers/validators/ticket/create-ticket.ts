import Joi from "joi";

export const createTicketValidation = Joi.object({
    sessionId: Joi.number().integer().required(),
    isSuperTicket: Joi.boolean().optional()
}).options({ abortEarly: false });
