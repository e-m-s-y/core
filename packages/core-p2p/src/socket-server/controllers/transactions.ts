import Hapi from "@hapi/hapi";
import { Container, Contracts } from "@solar-network/core-kernel";

import { Controller } from "./controller";

export class TransactionsController extends Controller {
    @Container.inject(Container.Identifiers.TransactionPoolProcessor)
    private readonly processor!: Contracts.TransactionPool.Processor;

    public async postTransactions(request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<string[]> {
        const result = await this.processor.process((request.payload as any).transactions as Buffer[]);
        return result.accept;
    }
}
