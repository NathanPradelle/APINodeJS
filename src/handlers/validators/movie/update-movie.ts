import Joi from "joi";

export const updateMovieValidation = Joi.object({
    title: Joi.string().min(1).max(255),
    synopsis: Joi.string().min(10),
    duration: Joi.number().integer().min(1),
    genres: Joi.array().items(Joi.string()).min(1)
}).options({ abortEarly: false });
