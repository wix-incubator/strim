import { Observer } from 'rxjs'
import { webSocket, WebSocketSubject } from 'rxjs/webSocket'
import * as utils from './strimUtils'
import {
  Environment,
  IStrimExecFuncDataPiped,
  IStrimExecFuncDataInput,
  IStrimOptions,
} from '../types'

interface IStrim {
  pipe(strim: IStrimExecFuncDataInput): IStrim
  subscribe(observer: Observer<any>): Promise<IStrim>
  to(env: Environment): IStrim
}

function addScript(src: string) {
  const head = document.getElementsByTagName('head')[0]
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = src
  head.appendChild(script)
}
addScript('/strim/strim.js')

export default class Strim implements IStrim {
  private pipeItems: IStrimExecFuncDataPiped[] = []
  private lastEnv: Environment
  private websocketSubject: WebSocketSubject<any>
  private wsUrl: string

  constructor({ wsUrl = 'ws://localhost:4321/strim' }: IStrimOptions = {}) {
    this.lastEnv = utils.getDefaultEnv()
    this.wsUrl = wsUrl
  }

  public pipe(strim: IStrimExecFuncDataInput): IStrim {
    const pipeItem: IStrimExecFuncDataPiped = {
      ...strim,
      env: strim.env ? strim.env : this.lastEnv,
    }

    if (
      pipeItem.env === Environment.Server &&
      this.lastEnv === Environment.Client
    ) {
      this.websocketSubject = webSocket(this.wsUrl)
    }

    this.lastEnv = pipeItem.env
    this.pipeItems.push(pipeItem)
    return this
  }

  public to(env: Environment, worker: boolean = false): IStrim {
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
