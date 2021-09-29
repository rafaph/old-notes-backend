import faker from "faker";
import sinon from "sinon";
import { DatabaseAddAccount } from "@app/authentication/data/use-case/database-add-account";
import { Encrypter } from "@app/authentication/data/protocol/encrypter";
import { AddAccount } from "@app/authentication/domain/use-case/add-account";
import { AddAccountRepository } from "@app/authentication/data/protocol/add-account-repository";

const FAKE_ENCRYPTED_PASSWORD = faker.internet.password();
const FAKE_ACCOUNT_MODEL_ID = faker.datatype.uuid();

const makeEncrypter = (): Encrypter => {
    class EncryterStub implements Encrypter {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public async encrypt(_value: string): Promise<string> {
            return FAKE_ENCRYPTED_PASSWORD;
        }
    }

    return new EncryterStub();
};

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        public async execute(input: AddAccountRepository.Input): Promise<AddAccountRepository.Output> {
            return {
                ...input,
                id: FAKE_ACCOUNT_MODEL_ID,
            };
        }
    }

    return new AddAccountRepositoryStub();
};

const makeInput = (input: Partial<AddAccount.Input> = {}): AddAccount.Input => ({
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...input,
});

const makeSut = (): {
    encrypterStub: Encrypter,
    sut: DatabaseAddAccount
    addAccountRepositoryStub: AddAccountRepository,
} => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    return {
        encrypterStub,
        addAccountRepositoryStub,
        sut: new DatabaseAddAccount(encrypterStub, addAccountRepositoryStub),
    };
};

describe("DatabaseAddAccount", () => {
    it("Should call Encrypter with correct password", async () => {
        const { sut, encrypterStub } = makeSut();
        const input = makeInput();
        const encryptStub = sinon.spy(encrypterStub, "encrypt");

        await sut.execute(input);

        sinon.assert.calledOnceWithExactly(encryptStub, input.password);
    });

    it("Should throw if Encrypter throws", async () => {
        const { sut, encrypterStub } = makeSut();
        const input = makeInput();
        sinon.stub(encrypterStub, "encrypt").rejects();

        await expect(sut.execute(input)).to.eventually.be.rejected;
    });

    it("Should call AddAccountRepository with correct values", async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const input = makeInput();

        const addSpy = sinon.spy(addAccountRepositoryStub, "execute");

        await sut.execute(input);

        sinon.assert.calledOnceWithExactly(addSpy, {
            name: input.name,
            email: input.email,
            password: FAKE_ENCRYPTED_PASSWORD,
        });
    });

    it("Should throw if AddAccountRepository throws", async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const input = makeInput();
        sinon.stub(addAccountRepositoryStub, "execute").rejects();

        await expect(sut.execute(input)).to.eventually.be.rejected;
    });

    it("Should return an account on success", async () => {
        const { sut } = makeSut();
        const input = makeInput();

        await expect(sut.execute(input)).to.eventually.be.deep.equal({
            ...input,
            id: FAKE_ACCOUNT_MODEL_ID,
            password: FAKE_ENCRYPTED_PASSWORD,
        });
    });
});