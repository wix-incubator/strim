import { Observer } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
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
  private websocketSubject: WebSocketSubject<any>

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
    if (env === Environment.Server && this.lastEnv === Environment.Client) {
      this.websocketSubject = webSocket('ws://localhost:8081')
    }
    this.lastEnv = env
    return this
  }

  public async subscribe(
    observerOrNext: Observer<any> | ((value: any) => void) = console.log,
    error: (error: any) => void = console.error,
    complete?: () => void,
  ): Promise<IStrim> {
    const pipeItemsByEnvironment = utils.splitToEnvironment(this.pipeItems)

    const pipeableFuncsByEnvironment = await utils.convertToPipeableFuncs(
      pipeItemsByEnvironment,
    )

    const fullStrim = utils.convertToFullStrim(
      pipeableFuncsByEnvironment,
      this.websocketSubject,
    )

    // @ts-ignore
    fullStrim.subscribe(observerOrNext, error, complete)

    return this
  }
}
