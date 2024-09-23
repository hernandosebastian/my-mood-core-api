export interface ICognitoRequestError extends Error {
  code: string;
  type: string;
}
