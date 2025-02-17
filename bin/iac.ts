#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DevStack } from '../lib/dev-stack';

const app = new cdk.App();
new DevStack(app, 'DevStack');
