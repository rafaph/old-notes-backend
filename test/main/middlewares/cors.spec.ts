import request from "supertest";
import app from "@app/main/config/app";


describe("@integration CORS Middleware", () => {
    it("Should enable CORS", async () => {
        const fakeRoute = "/test-cors";

        app.options(fakeRoute, (_, response) => {
            response.send();
        });

        await request(app)
            .options(fakeRoute)
            .expect("access-control-allow-origin", "*")
            .expect("access-control-allow-methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
            .expect("access-control-allow-headers", "*");
    });
});
