export interface IFrameButton {
  index: string;
  content: string;
  action?: string;
  target?: string;
  post_url?: string;
}
export interface FrameDetails {
  version: string | null;
  image: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogType: string | null;
  ogImage: string | null;
  siteURL: string | null;
  postURL: string | null;
  buttons: IFrameButton[];
  inputText?: string | null;
  state?: string | null;
  ofProtocolIdentifier?: string | null;
}

export interface IFrame {
  isValidFrame: boolean;
  frameType: string;
  frameDetails?: FrameDetails;
  message?: string;
}
