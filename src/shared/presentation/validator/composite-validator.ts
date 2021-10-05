import { Validator } from "@app/shared/presentation/protocol/validator";

export class CompositeValidator implements Validator {
    public constructor(private readonly validators: Validator[]) {
    }

    public async validate(input: unknown): Promise<Error | undefined> {
        for (const validator of this.validators) {
            const result = await validator.validate(input);
            if (result) {
                return result;
            }
        }

        return undefined;
    }
}
