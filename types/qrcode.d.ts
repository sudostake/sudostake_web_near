declare module "qrcode" {
  type ToDataUrlOptions = {
    width?: number;
    margin?: number;
  };

  const QRCode: {
    toDataURL(text: string, options?: ToDataUrlOptions): Promise<string>;
  };

  export default QRCode;
}
