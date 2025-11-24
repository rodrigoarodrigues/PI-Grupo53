export interface UserWallet {
  userId: number;
  wallet: number;
}

export async function getUserWallet(userId: number): Promise<UserWallet> {
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}/wallet`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar saldo');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
}

