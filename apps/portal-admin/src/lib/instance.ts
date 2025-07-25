import { APIClient } from "./client";

export const apiClient = new APIClient(process.env.NEXT_PUBLIC_API_URL || "");
