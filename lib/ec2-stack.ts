import * as fs from "fs";

import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";

export interface props extends StackProps {
  projectName: String;
  envName: String;
  vpc: ec2.IVpc;
}
export class Ec2Stack extends Stack {
  public readonly ec2SecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: props) {
    super(scope, id, props);

    /**
     * Create a Role
     */
    const ec2Role = new iam.Role(this, `${props.projectName}-${props.envName}-ec2role`, {
      roleName: `${props.projectName}-${props.envName}-ec2role`,
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    ec2Role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"));
    ec2Role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("PowerUserAccess"));

    /**
     * Create SecurityGroups
     */
    // EC2 SecurityGroup
    this.ec2SecurityGroup = new ec2.SecurityGroup(this, `${props.projectName}-${props.envName}-ec2sg`, {
      vpc: props.vpc,
      securityGroupName: `${props.projectName}-${props.envName}-ec2sg`,
    });
    Tags.of(this.ec2SecurityGroup).add("Name", `${props.projectName}-${props.envName}-ec2sg`);

    /**
     * Create a EC2
     */
    // Linux
    const instanceProfileForLinux = new iam.CfnInstanceProfile(this, `${props.projectName}-${props.envName}-instanceProfileForLinux`, {
      roles: [ec2Role.roleName],
    });
    const lunchTemplateForLinux = new ec2.CfnLaunchTemplate(this, `${props.projectName}-${props.envName}-lunchTemplateForLinux`, {
      launchTemplateData: {
        iamInstanceProfile: {
          arn: instanceProfileForLinux.attrArn,
        },
        imageId: "ami-07200fa04af91f087",
        instanceType: "t3.small",
        instanceMarketOptions: {
          marketType: "spot",
          spotOptions: {
            instanceInterruptionBehavior: "stop",
            spotInstanceType: "persistent",
          },
        },
      },
      launchTemplateName: `${props.projectName}-${props.envName}-lunchTemplateForLinux`,
    });
    new ec2.CfnInstance(this, `${props.projectName}-${props.envName}-ubuntu-ec2`, {
      launchTemplate: {
        launchTemplateId: lunchTemplateForLinux.ref,
        version: lunchTemplateForLinux.attrLatestVersionNumber,
      },
      securityGroupIds: [this.ec2SecurityGroup.securityGroupId],
      subnetId: props.vpc.publicSubnets[0].subnetId,
      tags: [
        {
          key: "Name",
          value: `${props.projectName}-${props.envName}-ubuntu-ec2`,
        },
      ],
      userData: fs.readFileSync(`${__dirname}/userdata/userdata.sh`, "base64"),
    });
  }
}
