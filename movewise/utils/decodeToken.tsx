import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  person_id: number;
  email: string;
  is_admin: boolean;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): TokenPayload => {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Invalid token format');
  }
};

export const getPersonIdFromToken = (token: string): number => {
  const decoded = decodeToken(token);
  return decoded.person_id;
};

export const isAdmin = (token: string): boolean => {
  const decoded = decodeToken(token);
  return decoded.is_admin;
};