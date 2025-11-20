declare module 'pdf-parse' {
  interface PdfData {
    text: string;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      IsCollectionPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
      [key: string]: any;
    };
    metadata: any;
    numpages: number;
    numrender: number;
    version: string;
  }

  interface PdfOptions {
    pagerender?: (pageData: any) => Promise<string>;
    max?: number;
    version?: string;
    [key: string]: any;
  }

  function parse(dataBuffer: Buffer, options?: PdfOptions): Promise<PdfData>;

  export default parse;
}