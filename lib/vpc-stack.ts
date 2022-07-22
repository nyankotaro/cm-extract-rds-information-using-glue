import { Construct } from "constructs";
import { Stack, StackProps } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface props extends StackProps {
  projectName: String;
  envName: String;
}

export class VpcStack extends Stack {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: props) {
    super(scope, id, props);

    /**
     * Create a Vpc
     */
    this.vpc = new ec2.Vpc(this, `${props.projectName}-${props.envName}-vpc`, {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 0,
    });
    this.vpc.addGatewayEndpoint(`${props.projectName}-${props.envName}-s3-endpoint`, {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });
  }
}
