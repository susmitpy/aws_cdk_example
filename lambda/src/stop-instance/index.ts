import { EC2Client, StopInstancesCommand } from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({});

export const handler = async (): Promise<void> => {
  try {
    await ec2Client.send(new StopInstancesCommand({
      InstanceIds: [process.env.INSTANCE_ID!]
    }));
  } catch (error) {
    console.error('Error stopping instance:', error);
    throw error;
  }
};
