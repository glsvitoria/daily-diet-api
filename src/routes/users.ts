import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const users = await knex("users").select("*");

    return { users };
  });

  app.get("/:id", async (req, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getUserParamsSchema.parse(req.params);

    const user = await knex("users").where({ id }).first();

    return { user };
  });

  app.post("/", async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });
    const { name, email } = createUserBodySchema.parse(req.body);

    const userExists = await knex("users")
      .where({ email })
      .orWhere({ name })
      .first();

    if (userExists) {
      return reply.status(400).send("User already exists");
    }

    await knex("users").insert({
      name,
      email,
    });

    return reply.status(201).send();
  });

  app.get("/:id/metrics", async (req, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    });
    const { id } = getUserParamsSchema.parse(req.params);

    const user = await knex("users").where({ id }).first();

    if (!user) {
      return reply.status(404).send("User not found");
    }

    const meals = await knex("meals").where({ user_id: id }).select("*");

    const totalMeals = meals.length;
    const totalMealsInDiet = meals.filter(meal => meal.inDiet).length;
    const totalMealsNotInDiet = totalMeals - totalMealsInDiet;
    const { maxSequence } = meals.reduce(
      (acc, meal) => {
        if (meal.inDiet) {
          acc.sequence += 1;
          return acc;
        }
        acc.maxSequence = acc.sequence;
        acc.sequence = 0;
        return acc;
      },
      { sequence: 0, maxSequence: 0 },
    );

    return {
      totalMeals,
      totalMealsInDiet,
      totalMealsNotInDiet,
      totalMealsInDietSequence: maxSequence,
    };
  });
}
