import {Observer, Observable} from 'rxjs';
import * as utils from './strimUtils';
import {Environment, IStrimExecFuncData} from '../types';

interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim;
  subscribe(observer: Observer<any>): IStrim;
  to(env: Environment): IStrim;
}

export default class Strim implements IStrim {
  private _strim: (IStrimExecFuncData | Environment | IStrim)[] = [];
  private env;
  Environment;

  constructor(env: Environment = utils.getDefaultEnv()) {
    this.env = env;
  }

  public pipe(strim: IStrimExecFuncData = {module: 'global', func: 'default'}): IStrim {
    this._strim.push(strim);
    return this;
  }

  public to(env: Environment): IStrim {
    this._strim.push(env);
    return this;
  }

  public subscribe(
    observerOrNext?: Observer<any> | ((value: any) => void),
    error?: (error: any) => void,
    complete?: () => void
  ): IStrim {
    const splittedStream = utils.splitToEnvironment(this._strim);

    return this;
  }
}
