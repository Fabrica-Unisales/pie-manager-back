export interface JwtPayload {
  sub: number;
  email: string;
  roles?: string[];
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface UserRequest {
  id: number;
  email: string;
  roles?: string[];
  permissions?: string[];
}

export interface AuthenticatedRequest extends Request {
  user: UserRequest;
} 