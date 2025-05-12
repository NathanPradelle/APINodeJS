import Joi from "joi";

export const createSessionValidation = Joi.object({
    movieId: Joi.number().integer().required(),
    roomId: Joi.number().integer().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required()
}).options({ abortEarly: false });
