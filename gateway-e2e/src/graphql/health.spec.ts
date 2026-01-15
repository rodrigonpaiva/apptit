import axios from "axios";

describe("POST /graphql", () => {
  it("health query should return true", async () => {
    const res = await axios.post("/graphql", {
      query: "query { health }",
    });

    expect(res.status).toBe(200);
    expect(res.data?.data?.health).toBe(true);
  });
});
