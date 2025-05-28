import apiClient from "./apiClient";
/**
 * Example of response: {
    "operator": 1003,
    "truck": 1,
    "order": "1334567890ABCDEF1234567890ABCDEF",
    "assigned_at": "2025-04-27T12:00:00Z",
    "rol": "leader"
}
 */
interface PatchAssignResponse {
    operator: number;
    truck: number;
    order: string;
    assigned_at: string;
    rol: string;
}

export const PatchAssign = async (id: number, formData: FormData) => {
    try {
        const response = await apiClient.patch<PatchAssignResponse>(`/assign/${id}/update/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating operator:", error);
        throw error;
    }
}