import { Duration, RemovalPolicy, SecretValue, Stack, StackProps, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as rds from "aws-cdk-lib/aws-rds";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface VpcProps extends StackProps {
  projectName: String;
  envName: String;
  vpc: ec2.IVpc;
  ec2SecurityGroup: ec2.ISecurityGroup;
  bucket: s3.IBucket;
}
export class RdsStack extends Stack {
  public readonly sqlserver: rds.IDatabaseInstance;
  public readonly rdsSecurityGroup: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id, props);

    /**
     * Create a Role
     */
    const bucketName = props.bucket.bucketName;
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "s3:ListAllMyBuckets",
          Resource: "*",
        },
        {
          Effect: "Allow",
          Action: ["s3:ListBucket", "s3:GetBucketACL", "s3:GetBucketLocation"],
          Resource: `arn:aws:s3:::${bucketName}`,
        },
        {
          Effect: "Allow",
          Action: ["s3:GetObject", "s3:PutObject", "s3:ListMultipartUploadParts", "s3:AbortMultipartUpload"],
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    };
    const customPolicyDocument = iam.PolicyDocument.fromJson(policyDocument);
    const newManagedPolicy = new iam.ManagedPolicy(this, "MyNewManagedPolicy", {
      document: customPolicyDocument,
    });
    const rdsRole = new iam.Role(this, `${props.projectName}-${props.envName}-rdsrole`, {
      assumedBy: new iam.ServicePrincipal("rds.amazonaws.com"),
      managedPolicies: [newManagedPolicy],
      roleName: `${props.projectName}-${props.envName}-rdsrole`,
    });

    // RDS SecurityGroup
    this.rdsSecurityGroup = new ec2.SecurityGroup(this, `${props.projectName}-${props.envName}-rdssg`, {
      vpc: props.vpc,
      securityGroupName: `${props.projectName}-${props.envName}-rdssg`,
    });
    this.rdsSecurityGroup.addIngressRule(props.ec2SecurityGroup, ec2.Port.allTraffic());
    this.rdsSecurityGroup.addIngressRule(this.rdsSecurityGroup, ec2.Port.allTraffic());
    Tags.of(this.rdsSecurityGroup).add("Name", `${props.projectName}-${props.envName}-rdssg`)

    /**
     * Create a ParmeterGroup
     */
    const parameterGroup = new rds.ParameterGroup(this, "MySQLParameterGroup", {
      engine: rds.DatabaseInstanceEngine.sqlServerEx({
        version: rds.SqlServerEngineVersion.VER_15_00_4073_23_V1,
      }),
    });

    /**
     * Create a Databese
     */
    this.sqlserver = new rds.DatabaseInstance(this, "RDS", {
      engine: rds.DatabaseInstanceEngine.sqlServerEx({
        version: rds.SqlServerEngineVersion.VER_15_00_4073_23_V1,
      }),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      credentials: rds.Credentials.fromPassword("admin", SecretValue.unsafePlainText("pa$$w0rd")),
      allocatedStorage: 20,
      backupRetention: Duration.days(0),
      deleteAutomatedBackups: true,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.SMALL),
      parameterGroup: parameterGroup,
      removalPolicy: RemovalPolicy.DESTROY,
      s3ImportRole: rdsRole,
      securityGroups: [this.rdsSecurityGroup],
    });
  }
}
