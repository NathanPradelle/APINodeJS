import Joi from "joi";

export const createTransactionValidation = Joi.object({
    amount: Joi.number().positive().required(),
    type: Joi.string().valid("deposit", "withdraw").required()
}).options({ abortEarly: false });
