interface AuthenticationRequest {
  email: string;
  password: string;
}

interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
}

interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}

interface LogoutResponse {
  result: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}