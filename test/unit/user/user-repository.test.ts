import { expect } from "chai";
import sinon from "sinon";
import { makeUserPayload, makeUserWithID, makeUserRepository } from "@test/helpers/user-factories";
import { UserRepository } from "@app/domains/user/core/repositories/user-repository";
import faker from "faker";
import { INTERNAL_SERVER_ERROR } from "http-status";

describe("UserRepository @unit", () => {
    describe("Sanity tests", () => {
        it("should exists", () => {
            expect(UserRepository).to.be.not.null;
            expect(UserRepository).to.be.not.undefined;
        });

        it("should be a class", () => {
            expect(makeUserRepository()).to.be.instanceOf(UserRepository);
        });

        it("should implements IUserRepository", () => {
            const sut = makeUserRepository();
            expect(sut.create).to.be.instanceOf(Function);
            expect(sut.findByEmail).to.be.instanceOf(Function);
        });
    });

    describe("Unit tests", () => {
        context("findByEmail method", () => {
            it("should find a user by email", async () => {
                const output = makeUserWithID();
                const findOne = sinon.stub().resolves(output);

                const sut = makeUserRepository({ findOne });

                const result = await sut.findByEmail(output.email);

                expect(result).to.be.deep.equal(output);
                expect(findOne).to.have.been.calledOnceWithExactly({
                    where: {
                        email: output.email,
                    },
                });
            });

            it("should return undefined if findByEmail returns undefined", async () => {
                const email = faker.internet.email();
                const findOne = sinon.stub().resolves();

                const sut = makeUserRepository({ findOne });

                const result = await sut.findByEmail(email);

                expect(result).to.be.undefined;
                expect(findOne).to.be.calledOnce;
            });

            it("should throw a ResponseError if findOne throws", async () => {
                const email = faker.internet.email();
                const findOne = sinon.stub().rejects();

                const sut = makeUserRepository({ findOne });

                await expect(sut.findByEmail(email)).to.eventually.be.rejected.with.property(
                    "status",
                    INTERNAL_SERVER_ERROR,
                );
                expect(findOne).to.be.calledOnce;
            });
        });

        context("create method", () => {
            it("should save a user", async () => {
                const output = makeUserWithID();
                const input = makeUserPayload();
                const save = sinon.stub().resolves(output);

                const sut = makeUserRepository({ save });

                const result = await sut.create(input);

                expect(result).to.be.deep.equal(output);
                expect(save).to.have.been.calledOnceWithExactly(input);
            });

            it("should throw a ResponseError if create throws", async () => {
                const input = makeUserPayload();
                const save = sinon.stub().rejects();

                const sut = makeUserRepository({ save });

                await expect(sut.create(input)).to.eventually.be.rejected.with.property(
                    "status",
                    INTERNAL_SERVER_ERROR,
                );
                expect(save).to.be.calledOnce;
            });
        });
    });
});