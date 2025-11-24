export interface CreateGameProps {
  uuid: string;
  title: string;
  imageUrl: string;
  quantity: number;
  description?: string;
  platform?: string;
  size?: string;
  multiplayer?: boolean;
  languages?: string;
}

export async function createGame(game: CreateGameProps) {
  try {
    const response = await fetch('http://localhost:3000/games', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(game),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar jogo');
    }

    return await response.json();
  } catch (error: any) {
    throw error;
  }
}
