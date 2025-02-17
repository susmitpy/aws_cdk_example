# AWS CDK Example - Scheduled Dev Environment Management

This repository demonstrates how to use AWS CDK to create an automated solution for managing development environments using Lambda functions and EventBridge schedules.

## Overview

This project showcases:
- Automated start/stop of EC2 instances on a schedule
- Automatic DNS updates using Cloudflare API
- Infrastructure as Code using AWS CDK
- TypeScript Lambda functions
- CORS-enabled Lambda function URLs

## Architecture

- `DevStack`: Main stack that creates Lambda functions and schedules
- `BaseStack`: Base stack with common configurations and utilities
- Lambda Functions:
  - `start-instance`: Starts EC2 instance and updates DNS
  - `stop-instance`: Stops EC2 instance

## Schedule

Development environment automatically:
- Starts at 09:30 AM IST (Monday-Friday)
- Stops at 11:00 PM IST (Monday-Friday)

## Prerequisites

- Node.js 18.x or later
- AWS CLI configured
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- `.env` file with required environment variables:
  ```
  INSTANCE_ID=<your-ec2-instance-id>
  CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>
  ```

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd aws_cdk_example
```

2. Install dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```

4. Deploy the stack
```bash
cdk deploy
```

## Project Structure

```
.
├── bin/
│   └── iac.ts                 # CDK app entry point
├── lib/
│   ├── base-stack.ts          # Base stack with common configurations
│   └── dev-stack.ts           # Main stack definition
├── lambda/
│   └── src/
│       ├── start-instance/    # Lambda function to start EC2
│       └── stop-instance/     # Lambda function to stop EC2
└── package.json
```

## Features

- **Automatic Instance Management**: Scheduled start/stop of EC2 instances
- **DNS Management**: Automatic update of DNS records via Cloudflare
- **Cost Optimization**: Ensures dev environments run only during work hours
- **Security**: IAM roles with least privilege access
- **Monitoring**: CloudWatch logs with 3-day retention