import { Construct } from "constructs";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface props extends StackProps {
  projectName: String;
  envName: String;
}

export class S3Stack extends Stack {
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: props) {
    super(scope, id, props);

    /**
     * Create a S3
     */
    this.bucket = new s3.Bucket(this, `${props.projectName}-${props.envName}-s3`, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    this.exportValue(this.bucket.bucketArn)
  }
}
