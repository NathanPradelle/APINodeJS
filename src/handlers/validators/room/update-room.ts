import Joi from "joi";

export const updateRoomValidation = Joi.object({
    name: Joi.string().min(1).max(255),
    description: Joi.string().min(10),
    images: Joi.array().items(Joi.string()).min(1),
    type: Joi.string(),
    capacity: Joi.number().integer().min(15).max(30),
    isAccessible: Joi.boolean(),
    isInMaintenance: Joi.boolean()
}).options({ abortEarly: false });
