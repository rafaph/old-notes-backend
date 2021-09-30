import { Sequelize } from "sequelize";
import faker from "faker";
import { TestDatabase } from "@test/helper/test-database";
import { SequelizeAddAccountRepository } from "@app/authentication/infrastructure/database/sequelize/sequelize-add-account-repository";
import { AddAccountRepository } from "@app/authentication/data/protocol/add-account-repository";

const makeSut = (sequelize: Sequelize): SequelizeAddAccountRepository => (
    new SequelizeAddAccountRepository(sequelize)
);

const makeInput = (input: Partial<AddAccountRepository.Input> = {}): AddAccountRepository.Input => ({
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...input,
});

describe("@integration SequelizeAddAccountRepository", () => {
    const testDatabase = new TestDatabase();
    const sequelize = testDatabase.sequelize;

    before(async () => {
        await testDatabase.setUp();
    });

    beforeEach(async () => {
        await testDatabase.truncate();
    });

    after(async () => {
        await testDatabase.cleanUp();
    });

    it("Should return an account on success", async () => {
        const sut = makeSut(sequelize);
        const input = makeInput();

        const account = await sut.execute(input);

        expect(account.id).to.not.be.undefined;
        expect(account.name).to.be.equal(input.name);
        expect(account.email).to.be.equal(input.email);
        expect(account.password).to.be.equal(input.password);
    });
});