import Joi from "joi";

export const createRoomValidation = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(10).required(),
    images: Joi.array().items(Joi.string()).min(1).required(),
    type: Joi.string().required(),
    capacity: Joi.number().integer().min(15).max(30).required(),
    isAccessible: Joi.boolean().default(false),
    isInMaintenance: Joi.boolean().default(false)
}).options({ abortEarly: false });
