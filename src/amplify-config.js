// src/amplify-config.js

import { Amplify } from 'aws-amplify';

const awsExports = {
    Auth: {
        Cognito: {
            userPoolId: "ap-south-1_yEjd6Lsmj",
            userPoolClientId: "6f8if478adug3b75ii2gnjcnir",
            region: 'ap-south-1',
            authenticationFlowType: 'USER_SRP_AUTH',
            identityPoolId: 'ap-south-1:b0d6ae79-ba23-411e-9d6f-19097b5cd111'
        }
    },

    API: {
        REST: {
            PhotoAPI: {
                endpoint: 'https://e8wis9pu09.execute-api.ap-south-1.amazonaws.com/prod',
                region: 'ap-south-1'
            }
        }
    },

    Storage: {
        S3: {
            bucket: 'abdul-photo-vault-original-2025',
            region: 'ap-south-1',
            level: 'private'
        }
    }
};

Amplify.configure(awsExports);

export default awsExports;
