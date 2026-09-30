import { Message, ApiResponse } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export async function fetchMessages(limit?: number, offset?: number): Promise<ApiResponse<Message[]>> {
  try {
    const url = new URL(`${API_URL}/api/messages`);
    if (limit !== undefined) url.searchParams.append('limit', limit.toString());
    if (offset !== undefined) url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, data: [], error: (error as Error).message };
  }
}

export async function sendMessage(username: string, message: string): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, message }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, data: null as any, error: (error as Error).message };
  }
}
