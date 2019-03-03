import {Observer, Observable} from 'rxjs';
import * as utils from './strimUtils';
import {Environment, IStrimExecFuncData} from './types';

interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim;
  subscribe(observer: Observer<any>): IStrim;
  to(env: Environment): IStrim;
}

export default class Strim implements IStrim {

  private _strim: (IStrimExecFuncData | Environment | IStrim)[] = [];
  private env; Environment;

  constructor(env: Environment = utils.getDefaultEnv()){
    this.env = env;
  }

  public pipe(strim: IStrimExecFuncData): IStrim {
    this._strim.push(strim);
    return this;
  }

  public to(env: Environment): IStrim {
    this._strim.push(env);
    return this;
  }

  public subscribe(observer: Observer<any>): IStrim{
    const splittedStream =  utils.splitToEnvironment(this._strim);

    return this;
  }
}
