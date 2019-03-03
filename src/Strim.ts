import {Observer} from 'rxjs';

interface IStrimExecFuncData {
  module: string;
  function: string;
  arguments: any[];
}

enum Environment {
  Server,
  Client
}

interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim;
  subscribe(observer: Observer<any>): IStrim;
  to(env: Environment): IStrim;
}

export default class Stream implements IStrim {

  private _strim = [];

  pipe(strim: IStrimExecFuncData): IStrim {
    this._strim.push(strim);
    return this;
  }

  to(side: Environment): IStrim {
    this._strim.push(side);
    return this;
  }

  subscribe(observer: Observer<any>): IStrim{
    return this;
  }
}
