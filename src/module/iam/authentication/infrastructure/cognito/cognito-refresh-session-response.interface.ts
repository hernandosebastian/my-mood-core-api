import { IAccessTokenPayload } from '@iam/authentication/infrastructure/passport/access-token-payload.interface';

export interface ICognitoRefreshSessionResponse {
  idToken: {
    jwtToken: string;
    payload: IAccessTokenPayload;
  };
}
