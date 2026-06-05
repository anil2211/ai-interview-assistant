import { config } from '../config/env';
import { SUPPORTED_AUDIO_FORMATS, MAX_FILE_SIZE, ERROR_CODES } from '../utils/constants';
import { logger } from '../middleware/logger';
import { AppError } from '../middleware/errorHandler';
import { ITranscriptionResult } from '../types';
import aiService from './AIService';

interface SpeechProvider {
  transcribe(audioBuffer: Buffer, language: string): Promise<string>;
  transcribeStream(stream: NodeJS.ReadableStream, language: string): AsyncGenerator<string>;
  detectLanguage(audioBuffer: Buffer): Promise<string>;
}

class GoogleSpeechProvider implements SpeechProvider {
  private client: any = null;

  constructor() {
    try {
      // In production, initialize Google Speech client here
      // this.client = new SpeechClient({ keyFilename: config.speechToTextApiKey });
      logger.info('Google Speech provider initialized (mock mode)');
    } catch (error) {
      logger.warn('Failed to initialize Google Speech provider:', error);
    }
  }

  async transcribe(audioBuffer: Buffer, language: string): Promise<string> {
    if (!this.client) {
      return this.mockTranscribe(audioBuffer, language);
    }
    try {
      // const [response] = await this.client.recognize({
      //   config: { encoding: 'WEBM_OPUS', languageCode: language },
      //   audio: { content: audioBuffer.toString('base64') },
      // });
      // return response.results.map((r: any) => r.alternatives[0].transcript).join(' ');
      return this.mockTranscribe(audioBuffer, language);
    } catch (error: any) {
      logger.error('Google Speech transcription failed:', error);
      throw new AppError('Speech transcription failed', 500, ERROR_CODES.SPEECH_SERVICE_ERROR);
    }
  }

  async *transcribeStream(stream: NodeJS.ReadableStream, _language: string): AsyncGenerator<string> {
    for await (const chunk of stream) {
      yield `Transcribed: ${chunk.toString().substring(0, 50)}...`;
    }
  }

  async detectLanguage(_audioBuffer: Buffer): Promise<string> {
    return 'en';
  }

  private async mockTranscribe(_audioBuffer: Buffer, _language: string): Promise<string> {
    const messages = [
      'I believe the key aspect here is to understand the trade-offs between consistency and availability.',
      'My approach would be to start with the requirements and work through the architecture step by step.',
      'In my previous role, I led a team that implemented a similar solution using microservices.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

class AzureSpeechProvider implements SpeechProvider {
  constructor(_apiKey: string) {
    logger.info('Azure Speech provider initialized');
  }

  async transcribe(_audioBuffer: Buffer, _language: string): Promise<string> {
    try {
      // In production, call Azure Speech-to-Text API
      // const response = await axios.post(
      //   `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
      //   audioBuffer,
      //   { headers: { 'Ocp-Apim-Subscription-Key': this.apiKey } }
      // );
      // return response.data.DisplayText;
      return `[Azure STT] Transcribed audio in ${_language}`;
    } catch (error: any) {
      logger.error('Azure Speech transcription failed:', error);
      throw new AppError('Speech transcription failed', 500, ERROR_CODES.SPEECH_SERVICE_ERROR);
    }
  }

  async *transcribeStream(stream: NodeJS.ReadableStream, _language: string): AsyncGenerator<string> {
    for await (const chunk of stream) {
      yield `[Azure STT] Streaming: ${chunk.toString().substring(0, 50)}...`;
    }
  }

  async detectLanguage(_audioBuffer: Buffer): Promise<string> {
    return 'en';
  }
}

class SpeechService {
  private provider: SpeechProvider;
  private providerName: string;

  constructor() {
    this.providerName = config.speechToTextApiKey ? 'azure' : 'google';
    this.provider = this.createProvider();
    logger.info(`SpeechService initialized with provider: ${this.providerName}`);
  }

  private createProvider(): SpeechProvider {
    if (config.speechToTextApiKey) {
      return new AzureSpeechProvider(config.speechToTextApiKey);
    }
    return new GoogleSpeechProvider();
  }

  validateAudioFormat(buffer: Buffer): { valid: boolean; error?: string } {
    if (buffer.length === 0) {
      return { valid: false, error: 'Empty audio buffer' };
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return { valid: false, error: `Audio file exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    // Check magic bytes for common audio formats
    const header = buffer.toString('hex', 0, 4).toLowerCase();

    const formatSignatures: Record<string, string[]> = {
      'audio/wav': ['52494646'],
      'audio/mpeg': ['fffb', 'fff3', 'fff2', '494433'],
      'audio/ogg': ['4f676753'],
      'audio/webm': ['1a45dfa3'],
      'audio/mp4': ['66747970', '00000018'],
    };

    const matchedFormat = Object.entries(formatSignatures).find(([, sigs]) =>
      sigs.some(sig => header.startsWith(sig))
    );

    if (!matchedFormat) {
      return { valid: false, error: 'Unsupported audio format. Supported formats: WAV, MP3, OGG, WebM, MP4' };
    }

    return { valid: true };
  }

  async transcribeAudio(audioBuffer: Buffer, language: string = 'en'): Promise<ITranscriptionResult> {
    const validation = this.validateAudioFormat(audioBuffer);
    if (!validation.valid) {
      throw new AppError(validation.error!, 400, ERROR_CODES.VALIDATION_ERROR);
    }

    try {
      const text = await this.provider.transcribe(audioBuffer, language);
      return {
        text,
        isFinal: true,
        confidence: 0.95,
        language,
      };
    } catch (error) {
      logger.error('Transcription failed:', error);
      throw new AppError('Failed to transcribe audio', 500, ERROR_CODES.SPEECH_SERVICE_ERROR);
    }
  }

  async transcribeStream(
    stream: NodeJS.ReadableStream,
    language: string = 'en'
  ): Promise<AsyncGenerator<ITranscriptionResult>> {
    const generator = this.provider.transcribeStream(stream, language);

    async function* wrapGenerator(): AsyncGenerator<ITranscriptionResult> {
      for await (const text of generator) {
        yield {
          text,
          isFinal: false,
          confidence: 0.8,
          language,
        };
      }
    }

    return wrapGenerator();
  }

  async detectLanguage(audioBuffer: Buffer): Promise<string> {
    return this.provider.detectLanguage(audioBuffer);
  }

  async transcribeWithOpenAI(audioBuffer: Buffer, language: string = 'en'): Promise<ITranscriptionResult> {
    try {
      const text = await aiService.transcribeAudio(audioBuffer, language);
      return {
        text,
        isFinal: true,
        confidence: 0.97,
        language,
      };
    } catch (error) {
      logger.error('OpenAI transcription failed:', error);
      throw new AppError('Failed to transcribe audio with AI service', 500, ERROR_CODES.SPEECH_SERVICE_ERROR);
    }
  }

  getSupportedFormats(): string[] {
    return [...SUPPORTED_AUDIO_FORMATS];
  }
}

export const speechService = new SpeechService();
export default speechService;
