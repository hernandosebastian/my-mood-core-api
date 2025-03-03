#!/bin/bash
awslocal s3api create-bucket \
    --bucket ${S3_BUCKET_NAME} \
    --region ${S3_REGION} \
    --create-bucket-configuration LocationConstraint=${S3_REGION}

echo "S3 bucket '${S3_BUCKET_NAME}' created successfully" 