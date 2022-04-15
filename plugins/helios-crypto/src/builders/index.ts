import { AuthenticationBuilder } from "./authentication";
import { CharacterRegistrationBuilder } from "./character-registration";

export class BuilderFactory {
    public static authentication(): AuthenticationBuilder {
        return new AuthenticationBuilder();
    }

    public static characterRegistration(): CharacterRegistrationBuilder {
        return new CharacterRegistrationBuilder();
    }
}
