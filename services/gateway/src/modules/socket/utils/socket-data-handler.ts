import { Socket } from "net";
import { Subject } from "rxjs";

import { ISocketMessageEvent } from "../types";

const HEADER_LENGTH = 4;

export class SocketDataHandler {
  private bytesLeft = 0;
  private bytesArray = "";
  private _subject: Subject<ISocketMessageEvent>;

  constructor() {
    // TODO заменить на передачу колбэка
    this._subject = new Subject<ISocketMessageEvent>();
  }

  get subject() {
    return this._subject;
  }

  handleSocketData = (socket: Socket, data: Buffer): void => {
    const message = data.toString().replace(/\0/g, "").trim();
    const bufferLength = message.length;

    this.parse(socket, message, bufferLength, 0);
  };

  private parse(socket: Socket, message: string, bufferLength: number, currentByte: number) {
    if (currentByte >= bufferLength) {
      return;
    }

    // parsing header
    if (this.bytesLeft == 0) {
      this.parseHeader(message, bufferLength, currentByte);

      if (this.bytesArray.length >= HEADER_LENGTH) {
        const messageLength = parseInt(this.bytesArray);

        this.clearBytesArray();
        if (messageLength > 0) {
          this.bytesLeft = messageLength;
          const nextByte = currentByte + HEADER_LENGTH;

          this.parse(socket, message, bufferLength, nextByte);
        }
      }
    }
    // parsing body
    else {
      const overflow = this.bytesLeft > bufferLength - currentByte;
      const currentFragmentLength = overflow ? bufferLength - currentByte : this.bytesLeft;

      // TODO заменить метод
      const currentFragment = message.substr(currentByte, currentFragmentLength);
      this.pushToBytesArray(currentFragment);

      this.bytesLeft -= currentFragmentLength;

      if (this.bytesLeft == 0) {
        this.handleMessage(socket, this.bytesArray);
        this.clearBytesArray();
      }

      if (this.bytesLeft > 0 || overflow == false) {
        const nextByte = currentByte + currentFragmentLength;
        this.parse(socket, message, bufferLength, nextByte);
      }
    }
  }

  private parseHeader(message: string, bufferLength: number, currentByte: number) {
    let bytesToRead = 0;
    if (bufferLength < HEADER_LENGTH + 1) {
      bytesToRead = bufferLength;
    } else {
      bytesToRead = HEADER_LENGTH;
    }

    const header = message.substr(currentByte, bytesToRead);
    this.pushToBytesArray(header);
  }

  private clearBytesArray() {
    this.bytesArray = "";
  }

  private pushToBytesArray(bytes: string) {
    this.bytesArray += bytes;
  }

  private handleMessage(socket: Socket, message: string) {
    try {
      const data = JSON.parse(message);

      const messageEvent: ISocketMessageEvent = {
        sender: socket,
        event: data.event,
        payload: data.payload || "",
      };
      this.subject.next(messageEvent);
    } catch (error) {
      console.error(error);
    }
  }
}
