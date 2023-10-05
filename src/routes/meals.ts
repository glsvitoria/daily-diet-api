import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function mealsRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const meals = await knex("meals").select("*");

    return { meals };
  });

  app.get("/:id", async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamsSchema.parse(req.params);

    const meal = await knex("meals").select("*").where("id", id).first();

    if (!meal) {
      return reply.status(404).send("Meal not found");
    }

    return { meal };
  });

  app.post("/", async (req, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      user_id: z.string(),
      inDiet: z.boolean(),
      date: z.string(),
      hour: z.string(),
    });

    const { name, description, user_id, inDiet, date, hour } =
      createMealBodySchema.parse(req.body);

    const mealExists = await knex("meals").where({ name }).first();

    if (mealExists) {
      return reply.status(400).send("Meal already exists");
    }

    await knex("meals").insert({
      name,
      description,
      user_id,
      inDiet,
      date,
      hour,
    });

    return reply.status(201).send("Meal created");
  });

  app.put("/:id", async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamsSchema.parse(req.params);

    const meal = await knex("meals").where({ id }).first();

    if (!meal) {
      return reply.status(404).send("Meal not found");
    }

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      inDiet: z.boolean(),
      date: z.string(),
      hour: z.string(),
    });

    const { name, description, inDiet, date, hour } =
      createMealBodySchema.parse(req.body);

    await knex("meals").where({ id }).update({
      name,
      description,
      inDiet,
      date,
      hour,
    });

    return reply.status(200).send("Meal updated");
  });

  app.delete("/:id", async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamsSchema.parse(req.params);

    const meal = await knex("meals").where({ id }).first();

    if (!meal) {
      return reply.status(404).send("Meal not found");
    }

    await knex("meals").where({ id }).del();

    return reply.status(200).send("Meal deleted");
  });

  app.get("/user/:id", async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getMealParamsSchema.parse(req.params);

    const meals = await knex("meals").where("user_id", id);

    if (!meals) {
      return reply.status(404).send("Meal not found");
    }

    return { meals };
  });
}
