import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

/** Shared Axios instance for backend HTTP calls (terminal commands, on-demand fetches). */
export const api = axios.create({ baseURL: API_BASE_URL });
