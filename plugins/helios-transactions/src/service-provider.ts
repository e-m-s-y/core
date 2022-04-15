import { Providers } from "@solar-network/core-kernel";

import { Plugin } from "./service";

export class ServiceProvider extends Providers.ServiceProvider {
    public async register(): Promise<void> {
        const symbol = Symbol.for(Plugin.ID);

        this.app.bind<Plugin>(symbol).to(Plugin).inSingletonScope();
        this.app.get<Plugin>(symbol).register();
    }

    public async bootWhen(): Promise<boolean> {
        return !!this.config().get("enabled");
    }
}
