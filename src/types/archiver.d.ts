declare module "archiver" {
  interface ArchiverOptions {
    zlib?: { level?: number };
  }

  interface Archiver {
    pipe(destination: any): void;
    directory(dirpath: string, destpath?: string | false): Archiver;
    finalize(): Promise<void>;
  }

  function archiver(format: string, options?: ArchiverOptions): Archiver;

  export = archiver;
}
