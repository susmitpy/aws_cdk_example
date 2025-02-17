import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { BaseStack } from './base-stack';

dotenv.config({ path: path.join(__dirname, '../.env') });

export class DevStack extends BaseStack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const startDevLambda = this.createLambdaFunction('StartDev', {
      handler: 'dist/start-instance/index.handler',
      environment: {
        INSTANCE_ID: process.env.INSTANCE_ID!,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN!,
        ENV: 'dev',
      },
      timeout: cdk.Duration.minutes(1)
    });

    const stopDevLambda = this.createLambdaFunction('StopDev', {
      handler: 'dist/stop-instance/index.handler',
      environment: {
        INSTANCE_ID: process.env.INSTANCE_ID!
      }
    });

    startDevLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.GET],
        allowedHeaders: ['*']
      }
    });

    stopDevLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ['*'],
        allowedMethods: [lambda.HttpMethod.GET],
        allowedHeaders: ['*']
      }
    });

    this.createSchedule('StartDev', '0', '4', startDevLambda);
    this.createSchedule('StopDev', '30', '17', stopDevLambda);
  }

  private createSchedule(name: string, minute: string, hour: string, fn: lambda.Function) {
    return new events.Rule(this, `${name}Schedule`, {
      schedule: events.Schedule.cron({
        minute,
        hour,
        weekDay: 'MON-FRI'
      }),
      targets: [new targets.LambdaFunction(fn)]
    });
  }
}
