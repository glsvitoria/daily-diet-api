import { execSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { app } from "../src/app";
import request from "supertest";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("pnpm knex -- migrate:rollback --all");
    execSync("pnpm knex -- migrate:latest");
  });

  it("should be able to create a new user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Guilherme Vitória",
        email: "guivitoria2010@hotmail.com",
      })
      .expect(201);
  });

  it("should be able to list a specific user", async () => {
    const createdUserResponse = await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    const getUserResponse = await request(app.server)
      .get(`/users/${userId}`)
      .expect(200);

    expect(getUserResponse.body.user).toEqual(
      expect.objectContaining({
        name: "Guilherme Vitória",
        email: "guivitoria2010@hotmail.com",
      }),
    );
  });

  it("should be able to list all metrics from a user", async () => {
    await request(app.server).post("/users").send({
      name: "Guilherme Vitória",
      email: "guivitoria2010@hotmail.com",
    });

    const listUsersResponse = await request(app.server).get("/users");

    const userId = listUsersResponse.body.users[0].id;

    await request(app.server).post("/meals").send({
      name: "Ovos",
      description: "Ovos mexidos",
      user_id: userId,
      inDiet: true,
      date: "10/10/2021",
      hour: "09:00",
    });

    await request(app.server).post("/meals").send({
      name: "Macarrão",
      description: "Macarrão com molho de tomate",
      user_id: userId,
      inDiet: false,
      date: "15/10/2021",
      hour: "12:00",
    });

    const getUserMetricsResponse = await request(app.server)
      .get(`/users/${userId}/metrics`)
      .expect(200);

    expect(getUserMetricsResponse.body).toEqual(
      expect.objectContaining({
        totalMeals: 2,
        totalMealsInDiet: 1,
        totalMealsNotInDiet: 1,
        totalMealsInDietSequence: 1,
      }),
    );
  });
});
