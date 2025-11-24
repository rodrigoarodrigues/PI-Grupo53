export interface DepositMoneyProps {
  userId: number;
  amount: number;
}

export async function depositMoney(data: DepositMoneyProps) {
  try {
    const response = await fetch(`http://localhost:3000/users/${data.userId}/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: data.amount }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || 'Erro ao depositar dinheiro');
      // Adicionar detalhes do erro para tratamento no componente
      (error as any).details = errorData.details;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
}

