import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as fs from 'fs';
import * as path from 'path';

export abstract class BaseStack extends cdk.Stack {
  protected readonly lambdaRole: iam.Role;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.lambdaRole = this.createLambdaRole();
  }

  protected createLambdaRole(): iam.Role {
    const role = new iam.Role(this, `${this.stackName}LambdaRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    
    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ec2:StartInstances',
        'ec2:StopInstances',
        'ec2:DescribeInstances'
      ],
      resources: ['*'],
    }));

    return role;
  }

  protected createLambdaFunction(name: string, config: {
    handler: string;
    environment: { [key: string]: string };
    timeout?: cdk.Duration;
  }): lambda.Function {
    const logGroup = new logs.LogGroup(this, `${name}LogGroup`, {
      retention: logs.RetentionDays.THREE_DAYS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const functionDir = config.handler.split('/')[1];
    const functionPath = path.join(__dirname, '../lambda/src', functionDir);
    const packageJsonPath = path.join(functionPath, 'package.json');

    let hasDependencies = false;
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      hasDependencies = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
    }

    const code = hasDependencies
      ? lambda.Code.fromAsset(functionPath, {
        bundling: {
          image: lambda.Runtime.NODEJS_18_X.bundlingImage,
          command: [
            'bash', '-c',
            'cp -r . /asset-output && cd /asset-output && npm ci && tsc'
          ],
          user: 'root'
        }
      })
      : lambda.Code.fromAsset(functionPath);

    return new lambda.Function(this, `${name}Function`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: `index.handler`,
      code,
      role: this.lambdaRole,
      timeout: config.timeout || cdk.Duration.seconds(30),
      environment: config.environment,
      logGroup: logGroup,
    });
  }
}
