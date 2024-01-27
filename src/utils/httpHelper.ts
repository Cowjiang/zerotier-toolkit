import { getClient } from '@tauri-apps/api/http';
const client = await getClient();
export const http = {
    get: (url: string, query: Record<string, any>) => {
        client.get(url, {
            query
        })
    }
}