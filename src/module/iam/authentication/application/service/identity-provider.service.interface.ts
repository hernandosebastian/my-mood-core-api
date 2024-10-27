import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { ISignUpResponse } from '@iam/authentication/application/dto/sign-up-response.interface';

export const IDENTITY_PROVIDER_SERVICE_KEY = 'identity_provider_service';

export interface IIdentityProviderService {
  signUp(username: string, password: string): Promise<ISignUpResponse>;
  signIn(username: string, password: string): Promise<ISignInResponse>;
  confirmUser(
    username: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse>;
  forgotPassword(username: string): Promise<ISuccessfulOperationResponse>;
  confirmPassword(
    username: string,
    newPassword: string,
    code: string,
  ): Promise<ISuccessfulOperationResponse>;
  resendConfirmationCode(
    username: string,
  ): Promise<ISuccessfulOperationResponse>;
}
