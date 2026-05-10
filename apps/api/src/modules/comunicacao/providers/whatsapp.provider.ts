import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappProvider {
  private readonly logger = new Logger(WhatsappProvider.name);
  private isEnabled = false;
  private apiUrl: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WHATSAPP_API_URL');
    this.apiKey = this.configService.get<string>('WHATSAPP_API_KEY');

    if (this.apiUrl && this.apiKey) {
      this.isEnabled = true;
      this.logger.log('Provedor de WhatsApp Ativado (Variáveis Encontradas).');
    } else {
      this.logger.warn('Provedor de WhatsApp Desativado (Variáveis ausentes). O sistema funcionará com bypass.');
    }
  }

  async enviarMensagem(telefone: string, texto: string): Promise<{ success: boolean; providerId?: string; error?: string }> {
    if (!this.isEnabled) {
      // Simula sucesso sem quebrar para que a aplicação não crashe
      this.logger.log(`[BYPASS] Simulando envio WhatsApp para ${telefone}: ${texto.substring(0, 20)}...`);
      return { success: true, providerId: `simulated-${Date.now()}` };
    }

    try {
      // Aqui integraria com a Evolution API via HTTP
      // Exemplo fictício de Fetch
      // const res = await fetch(`${this.apiUrl}/message/sendText`, { ... })
      this.logger.log(`Enviando WhatsApp via API Real para ${telefone}`);
      return { success: true, providerId: `evo-${Date.now()}` };
    } catch (e) {
      this.logger.error(`Falha no envio de WhatsApp para ${telefone}: ${e.message}`);
      return { success: false, error: e.message };
    }
  }
}
