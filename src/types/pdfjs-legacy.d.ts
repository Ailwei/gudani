declare module "pdfjs-dist/legacy/build/pdf" {
  const pdfjsLib: any;
  export * from "pdfjs-dist/types/src/pdf";
  export default pdfjsLib;
}

declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs" {
  const workerSrc: string;
  export default workerSrc;
}
