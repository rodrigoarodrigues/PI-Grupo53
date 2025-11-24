import { app } from "../index.js";
import { createPayment, processPaymentMock } from "../data/payments/createPayment.js";

export function getPaymentsRoutes() {
  app.post("/payments", async (c) => {
    const body = await c.req.json();
    try {
      const created = await createPayment(body);
      return c.json(created, 201);
    } catch (error: any) {
      return c.json({ error: error.message || "Erro ao processar pagamento" }, 400);
    }
  });

  app.post("/payments/mock", async (c) => {
    const body = await c.req.json();
    try {
      const forceSuccess = body.forceSuccess || false;
      const created = await processPaymentMock(body, forceSuccess);
      return c.json(created, 201);
    } catch (error: any) {
      return c.json({ error: error.message || "Erro ao processar pagamento" }, 400);
    }
  });
}

