import apiClient from "./apiClient";
/**
 * Example of response from the API
 * List of tools
 * {
    "count": 50,
    "next": "http://127.0.0.1:8000/tools/?page=2&page_size=10%2F",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "metal nail",
            "job": 3
        },
        {
            "id": 2,
            "name": "Hammer",
            "job": 3
        },
        {
            "id": 3,
            "name": "4 wheeler",
            "job": 3
        },
        {
            "id": 4,
            "name": "Hand truck",
            "job": 3
        },
        {
            "id": 5,
            "name": "Home protection",
            "job": 3
        },
        {
            "id": 6,
            "name": "Commercial bins",
            "job": 3
        },
        {
            "id": 7,
            "name": "Tape gun",
            "job": 1
        },
        {
            "id": 8,
            "name": "1.5",
            "job": 1
        },
        {
            "id": 9,
            "name": "3.0",
            "job": 1
        },
        {
            "id": 10,
            "name": "4.5",
            "job": 1
        }
    ],
    "current_company_id": 4
}
 */

export interface Tool {
    id: number;
    name: string;
    job: number;
    }

export interface ToolListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Tool[];
    current_company_id: number;
}

export const listTools = async (page: number, pageSize: number): Promise<ToolListResponse> => {
    try {
        const response = await apiClient.get<ToolListResponse>(`/tools/?page=${page}&page_size=${pageSize}`);
        console.log("Tools response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching tools:", error);
        throw error;
    }
}

export const getToolById = async (id: number): Promise<Tool> => {
    try {
        const response = await apiClient.get<Tool>(`/tools/${id}/`);
        console.log("Tool response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching tool:", error);
        throw error;
    }
}

export const createTool = async (tool: Tool): Promise<Tool> => {
    try {
        const response = await apiClient.post<Tool>('/tools/', tool);
        console.log("Tool created:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating tool:", error);
        throw error;
    }
}

export const deleteTool = async (id: number): Promise<void> => { 
    try {
        await apiClient.patch(`/tools/${id}/delete/`);
        console.log("Tool deleted:", id);
    } catch (error) {
        console.error("Error deleting tool:", error);
        throw error;
    }
}