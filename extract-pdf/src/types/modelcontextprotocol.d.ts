declare module '@modelcontextprotocol/sdk' {
  export class Server {
    constructor(options?: any);
    registerAdapter(adapter: any): void;
    registerMethod(name: string, callback: (params: any) => Promise<any>): void;
    listen(): Promise<void>;
    on(event: string, callback: (data: any) => void): void;
  }

  export class HttpAdapter {
    constructor(options?: any);
    use(app: any): void;
  }
}