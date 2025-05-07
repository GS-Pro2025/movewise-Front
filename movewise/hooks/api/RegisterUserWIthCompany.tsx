import apiClient from "./apiClient";

//{{base_url_api}}/registerWithCompany/
/**
 * Registry body example:
 * {
    "company": {
        "license_number": "CBA1234567",
        "name": "McDonalsSuper",
        "address": "4th elm Street",
        "zip_code": "1234Code"
    },
    "user": {
        "user_name": "Adminsote",
        "password": "password123",
        "person": {
            "email": "adminExample@example.com",
            "first_name": "example name",
            "last_name": "example Garcia",
            "birth_date": "1995-08-20",
            "phone": 3101234567,
            "address": "Example Street 456",
            "id_number": 111222,
            "type_id": "ID Card"
        }
    }
}
 * 
 */
export const registerUserWithCompany = async (body: any) => {
  try {
    const response = await apiClient.post("registerWithCompany/", body);
    console.log("Response from registerUserWithCompany:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error registering user with company:", error);
    throw error;
  }
};  
