import faker from "faker";
import sinon from "sinon";
import { DatabaseAddAccount } from "@app/authentication/data/use-case/database-add-account";
import { Encrypter } from "@app/authentication/data/protocol/encrypter";

const makeEncrypter = (): Encrypter => {
    class EncryterStub implements Encrypter {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public async encrypt(_value: string): Promise<string> {
            return "encrypted_value";
        }
    }

    return new EncryterStub();
};

const makeSut = (): { encrypter: Encrypter, sut: DatabaseAddAccount } => {
    const encrypter = makeEncrypter();
    return {
        encrypter,
        sut: new DatabaseAddAccount(encrypter)
    };
};

describe.only("DatabaseAddAccount", () => {
    it("Should call Encrypter with correct password", async () => {
        const { sut, encrypter } = makeSut();
        const input = {
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.internet.password()
        };
        const encryptStub = sinon.stub(encrypter, "encrypt");

        await sut.execute(input);

        sinon.assert.calledOnceWithExactly(encryptStub, input.password);
    });
});
