import Joi from "joi";

export const updateSessionValidation = Joi.object({
    movieId: Joi.number().integer(),
    roomId: Joi.number().integer(),
    startTime: Joi.date().iso(),
    endTime: Joi.date().iso()
}).options({ abortEarly: false });
