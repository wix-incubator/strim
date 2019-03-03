import {Observer} from "rxjs";

export interface IStrimExecFuncData {
  module: string;
  func: string;
  args: any[];
}

export enum Environment {
  Server,
  Client
}

export interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim;
  subscribe(observer: Observer<any>): IStrim;
  to(env: Environment): IStrim;
}
