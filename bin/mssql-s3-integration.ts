#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { VpcStack } from "../lib/vpc-stack";
import { Ec2Stack } from "../lib/ec2-stack";
import { RdsStack } from "../lib/rds-stack";
import { S3Stack } from "../lib/s3-stack";
import { GlueStack } from "../lib/glue-stack";

const app = new cdk.App();
const projectName = app.node.tryGetContext("projectName");
const envKey = app.node.tryGetContext("env");
const envValues = app.node.tryGetContext(envKey);
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const vpc = new VpcStack(app, `${projectName}-${envValues.envName}-vpc`, {
  projectName: projectName,
  envName: envValues.envName,
  env: env,
});

const ec2 = new Ec2Stack(app, `${projectName}-${envValues.envName}-ec2`, {
  projectName: projectName,
  envName: envValues.envName,
  env: env,
  vpc: vpc.vpc,
});

const s3 = new S3Stack(app, `${projectName}-${envValues.envName}-s3`, {
  projectName: projectName,
  envName: envValues.envName,
  env: env,
});

const rds = new RdsStack(app, `${projectName}-${envValues.envName}-rds`, {
  projectName: projectName,
  envName: envValues.envName,
  env: env,
  vpc: vpc.vpc,
  ec2SecurityGroup: ec2.ec2SecurityGroup,
  bucket: s3.bucket,
});

new GlueStack(app, `${projectName}-${envValues.envName}-gule`, {
  projectName: projectName,
  envName: envValues.envName,
  env: env,
  vpc: vpc.vpc,
  rdsSecurityGroup: rds.rdsSecurityGroup,
  sqlserver: rds.sqlserver
});
