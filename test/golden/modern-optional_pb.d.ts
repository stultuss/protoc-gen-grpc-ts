// package: com.modern
// file: modern/optional.proto

import * as jspb from 'google-protobuf';

export class OptMsg extends jspb.Message {
  hasName(): boolean;
  clearName(): void;
  getName(): string | undefined;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OptMsg.AsObject;
  static toObject(includeInstance: boolean, msg: OptMsg): OptMsg.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: OptMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OptMsg;
  static deserializeBinaryFromReader(message: OptMsg, reader: jspb.BinaryReader): OptMsg;
}

export namespace OptMsg {
  export type AsObject = {
    name?: string,
  }
}

