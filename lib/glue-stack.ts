import { Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_glue as glue } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";

export interface VpcProps extends StackProps {
  projectName: String;
  envName: String;
  vpc: ec2.IVpc;
  rdsSecurityGroup: ec2.ISecurityGroup;
  sqlserver: rds.IDatabaseInstance;
}

export class GlueStack extends Stack {
  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id, props);

    /**
     * Create SecurityGroups
     */
    // Glue SecurityGroup
    const glueSecurityGroup = new ec2.SecurityGroup(this, `${props.projectName}-${props.envName}-gluesg`, {
      vpc: props.vpc,
      securityGroupName: `${props.projectName}-${props.envName}-gluesg`,
    });
    Tags.of(glueSecurityGroup).add("Name", `${props.projectName}-${props.envName}-gluesg`);

    /**
     * Create a Role
     */
    const guleRole = new iam.Role(this, `${props.projectName}-${props.envName}-glue`, {
      roleName: `${props.projectName}-${props.envName}-glue`,
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
    });
    guleRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"));
    guleRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        `${props.projectName}-${props.envName}-add-policy`,
        "arn:aws:iam::aws:policy/service-role/AWSGlueServiceRole"
      )
    );

    /**
     * Create a Gule Connection
     */
    const cfnConnection = new glue.CfnConnection(this, `${props.projectName}-${props.envName}-glueconnectionc`, {
      catalogId: Stack.of(this).account,
      connectionInput: {
        connectionType: "JDBC",
        connectionProperties: {
          JDBC_CONNECTION_URL: `jdbc:sqlserver://${props.sqlserver.dbInstanceEndpointAddress}:${props.sqlserver.dbInstanceEndpointPort};databaseName=test`,
          USERNAME: "admin",
          PASSWORD: "pa$$w0rd",
        },
        physicalConnectionRequirements: {
          securityGroupIdList: [props.rdsSecurityGroup.securityGroupId],
          subnetId: props.vpc.isolatedSubnets[1].subnetId,
        },
      },
    });

    /**
     * Create a Glue crawler
     */
    const cfnCrawler = new glue.CfnCrawler(this, `${props.projectName}-${props.envName}-crowler`, {
      role: guleRole.roleArn,
      targets: {
        jdbcTargets: [
          {
            connectionName: cfnConnection.ref,
          },
        ],
      },
      schemaChangePolicy: {
        deleteBehavior: "LOG",
      },
      databaseName: `${props.projectName}-${props.envName}-db`,
      name: `${props.projectName}-${props.envName}-crawler`
    });
  }
}
