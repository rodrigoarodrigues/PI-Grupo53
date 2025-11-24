export interface UpdateGameProps {
  title?: string;
  imageUrl?: string;
  quantity?: number;
  description?: string;
  platform?: string;
  size?: string;
  multiplayer?: boolean;
  languages?: string;
}

export async function updateGame(gameId: number, game: UpdateGameProps) {
  try {
    const response = await fetch(`http://localhost:3000/games/${gameId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar jogo');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
}

