import { AddAccount } from "@app/authentication/domain/use-case/add-account";
import { Encrypter } from "@app/authentication/data/protocol/encrypter";

export class DatabaseAddAccount implements AddAccount {
    public constructor(
        private readonly encrypter: Encrypter,
    ) {
    }

    public async execute(input: AddAccount.Input): Promise<AddAccount.Output> {
        return {
            id: "valid_id",
            name: input.name,
            email: input.email,
            password: await this.encrypter.encrypt(input.password),
        };
    }
}
