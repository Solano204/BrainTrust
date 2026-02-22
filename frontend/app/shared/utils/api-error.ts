"use server";

import axios from "axios";

export const handleApiError = async (error: unknown): Promise<never> => {
    if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
    }
    throw error;
};