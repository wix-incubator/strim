import { Observer, Observable } from 'rxjs'
import * as utils from './strimUtils'
import { Environment, IStrimExecFuncData, PipeItem } from '../types'
import { PartialObserver } from 'rxjs/src/internal/types'

interface IStrim {
  pipe(strim: IStrimExecFuncData): IStrim
  subscribe(observer: Observer<any>): Promise<IStrim>
  to(env: Environment): IStrim
}

export default class Strim implements IStrim {
  private pipeItems: PipeItem[] = []
  private env: Environment

  constructor(env: Environment = utils.getDefaultEnv()) {
    this.env = env
  }

  public pipe(strim: IStrimExecFuncData): IStrim {
    this.pipeItems.push(strim)
    return this
  }

  public to(env: Environment): IStrim {
    this.pipeItems.push(env)
    return this
  }

  public async subscribe(
    observerOrNext?: Observer<any> | ((value: any) => void),
    error?: (error: any) => void,
    complete?: () => void,
  ): Promise<IStrim> {
    const splittedStream = utils.splitToEnvironment(this.pipeItems)
    //const environment = utils.getDefaultEnv()

    const firstObservable = await utils.runStrimFuncLocally(
      [],
      splittedStream[0].pipeItems as IStrimExecFuncData[],
    )

    firstObservable.subscribe(observerOrNext as PartialObserver<any>)

    return this
  }
}
