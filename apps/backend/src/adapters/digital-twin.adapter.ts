import {
  DigitalTwinsClient,
  DigitalTwinsAddOptionalParams,
  DigitalTwinsUpdateOptionalParams,
} from '@azure/digital-twins-core';
import { DefaultAzureCredential } from '@azure/identity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import{ ClientSecretCredential, TokenCredential } from '@azure/identity';



@Injectable()
export class DigitalTwinAdapter {
  private readonly client: DigitalTwinsClient;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('AZURE_ADT_ENDPOINT');
    const tenantId = this.configService.get<string>('AZURE_TENANT_ID');
    const clientId = this.configService.get<string>('AZURE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET');

    if (!endpoint || !tenantId || !clientId || !clientSecret) {
      throw new Error('Missing Azure ADT credentials in environment variables');
    }

    const credential: TokenCredential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret,
    );

    this.client = new DigitalTwinsClient(endpoint, credential);
//     if(this.client) {
//       console.log('DigitalTwinsClient initialized successfully');
//       console.log(`Endpoint: ${endpoint}`);
//       console.log(`Tenant ID: ${tenantId}`);
//       this.queryAllTwins().then((twins) => {
//   console.log(twins);
// }).catch((error) => {
//   console.error('Error fetching twins:', error);
// });

//     }
  }

  async createDigitalTwin(
    twinId: string,
    data: Record<string, any>,
    options?: DigitalTwinsAddOptionalParams,
  ): Promise<void> {
    await this.client.upsertDigitalTwin(twinId, JSON.stringify(data), options);
  }

  async updateDigitalTwin(
    twinId: string,
    patch: Array<{ op: string; path: string; value: any }>,
    options?: DigitalTwinsUpdateOptionalParams,
  ): Promise<void> {
    await this.client.updateDigitalTwin(twinId, patch, options);
  }

  async getDigitalTwin(twinId: string): Promise<Record<string, any>> {
    const twin = await this.client.getDigitalTwin(twinId);
    return twin.body as Record<string, any>;
  }

  async deleteDigitalTwin(twinId: string): Promise<void> {
    await this.client.deleteDigitalTwin(twinId);
  }

  async uploadModel(
    data: Record<string, any>,
  ): Promise<void> {
    await this.client.createModels([data]);
  }

  async deleteModel(
    modelId: string,
  ): Promise<void> {
    await this.client.deleteModel(modelId);
  }

  async queryAllTwins(): Promise<any[]> {
  const query = 'SELECT * FROM digitaltwins';
  const twins: any[] = [];
  const result = this.client.queryTwins(query);

  for await (const twin of result) {
    twins.push(twin);
  }

  return twins;
}

}
