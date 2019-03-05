import { Observer } from 'rxjs'
import * as utils from './strimUtils'
import {
  Environment,
  IStrimExecFuncDataPiped,
  IStrimExecFuncDataInput,
} from '../types'

interface IStrim {
  pipe(strim: IStrimExecFuncDataInput): IStrim
  subscribe(observer: Observer<any>): Promise<IStrim>
  to(env: Environment): IStrim
}

export default class Strim implements IStrim {
  private pipeItems: IStrimExecFuncDataPiped[] = []
  private lastEnv: Environment

  constructor() {
    this.lastEnv = utils.getDefaultEnv()
  }

  public pipe(strim: IStrimExecFuncDataInput): IStrim {
    const pipeItem: IStrimExecFuncDataPiped = {
      ...strim,
      env: strim.env ? strim.env : this.lastEnv,
    }

    this.pipeItems.push(pipeItem)
    return this
  }

  public to(env: Environment): IStrim {
    this.lastEnv = env
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

    // @ts-ignore
    fullStrim.subscribe(observerOrNext, error, complete)

    return this
  }
}
