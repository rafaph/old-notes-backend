import { IRouter } from "express";
import { ExpressRouteAdapter } from "@app/main/adapter/express-route-adapter";
import { makeLoginController } from "@app/main/factory/controller/authentication/login/make-login-controller";
import { makeSignUpController } from "@app/main/factory/controller/authentication/sign-up/make-sign-up-controller";


export function route(router: IRouter): void {
    router.post("/login", ExpressRouteAdapter.adapt(makeLoginController()));
    router.post("/sign-up", ExpressRouteAdapter.adapt(makeSignUpController()));
}
