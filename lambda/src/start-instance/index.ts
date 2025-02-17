import { EC2Client, StartInstancesCommand, DescribeInstancesCommand } from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({});

export const handler = async (): Promise<void> => {
  const instanceId = process.env.INSTANCE_ID;

  if (!instanceId) {
    throw new Error('INSTANCE_ID environment variable is required');
  }

  try {
    // Start the instance
    await ec2Client.send(new StartInstancesCommand({
      InstanceIds: [instanceId],
    }));

    // Wait for instance to be running and get IP
    let publicIp = '';
    while (!publicIp) {
      const describeResponse = await ec2Client.send(new DescribeInstancesCommand({
        InstanceIds: [instanceId],
      }));

      const instance = describeResponse.Reservations?.[0]?.Instances?.[0];
      if (instance?.State?.Name === 'running' && instance.PublicIpAddress) {
        publicIp = instance.PublicIpAddress;
      } else {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Update Cloudflare DNS records
    await updateCloudflareRecord(publicIp);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const devDnsRecords = {
  "frontend.myapp.com": "dnsRecordId",
  "backend.myapp.com": "dnsRecordId"
}
const devZoneId = "devZoneId"

const prodDnsRecords = {
  "myapp.com": "dnsRecordId",
  "api.myapp.com": "dnsRecordId"
}
const prodZoneId = "prodZoneId"

async function updateCloudflareRecord(ip: string): Promise<void> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const env = process.env.ENV;
  let dnsRecords: { [domain: string]: string };
  let zoneId: string;

  if (env === 'dev') {
    dnsRecords = devDnsRecords;
    zoneId = devZoneId;
  } else {
    dnsRecords = prodDnsRecords;
    zoneId = prodZoneId;
  }

  for (const [domain, recordId] of Object.entries(dnsRecords)) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'A',
        name: domain,
        content: ip,
        ttl: 120,
        proxied: false
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update DNS record ${recordId}: ${response.statusText}`);
    }
  }
}