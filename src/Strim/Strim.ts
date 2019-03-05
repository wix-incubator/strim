import { Observer } from 'rxjs'
import * as utils from './strimUtils'
import {
  Environment,
  IStrimExecFuncDataPiped,
  IStrimExecFuncDataInput,
} from '../types'
import { PartialObserver } from 'rxjs/src/internal/types'

interface IStrim {
  pipe(strim: IStrimExecFuncDataInput): IStrim
  subscribe(observer: Observer<any>): Promise<IStrim>
  to(env: Environment): IStrim
}

export default class Strim implements IStrim {
  private pipeItems: IStrimExecFuncDataPiped[] = []
  private env: Environment

  constructor() {
    this.env = utils.getDefaultEnv()
  }

  public pipe(strim: IStrimExecFuncDataInput): IStrim {
    const pipeItem: IStrimExecFuncDataPiped = {
      ...strim,
      env: strim.env ? strim.env : utils.getDefaultEnv(),
    }

    this.pipeItems.push(pipeItem)
    return this
  }

  public to(env: Environment): IStrim {
    this.env = env
    return this
  }

  public async subscribe(
    observerOrNext?: Observer<any> | ((value: any) => void),
    error?: (error: any) => void,
    complete?: () => void,
  ): Promise<IStrim> {
    const pipeItemsByEnvironment = utils.splitToEnvironment(this.pipeItems)

    const pipeableFuncsByEnvironment = await utils.convertToPipeableFuncs(
      pipeItemsByEnvironment,
    )

    const fullStrim = utils.convertToFullStrim(pipeableFuncsByEnvironment)

    // const firstObservable = await utils.runStrimLocally(null, environmentsStrims[0]
    //   .pipeItems as IStrimExecFuncData[])

    // @ts-ignore
    fullStrim.subscribe(observerOrNext, error, complete)

    return this
  }
}
