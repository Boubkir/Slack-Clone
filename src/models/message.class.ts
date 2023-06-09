import { JsonThreadMessage } from './thread-message.class';

export type JsonMessage = {
  userId: string;
  message: string;
  createdAt: string;
  threadMessages: JsonThreadMessage[];
};
export class Message {
  userId: string;
  message: string;
  createdAt: string;
  threadMessages: JsonThreadMessage[];

  constructor(obj?: any) {
    this.userId = obj ? obj.userId : '';
    this.message = obj ? obj.message : '';
    this.createdAt = Intl.DateTimeFormat('de-DE', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date());
    this.threadMessages = obj ? obj.allThreadMessages : '';
  }

  public toJSON(): JsonMessage {
    return {
      userId: this.userId,
      message: this.message,
      createdAt: this.createdAt,
      threadMessages: this.threadMessages,
    };
  }
}
