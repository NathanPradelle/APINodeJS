import Joi from "joi";

export const createMovieValidation = Joi.object({
    title: Joi.string().min(1).max(255).required(),
    synopsis: Joi.string().min(10).required(),
    duration: Joi.number().integer().min(1).required(),
    genres: Joi.array().items(Joi.string()).min(1).required()
}).options({ abortEarly: false });
